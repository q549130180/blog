---
layout: post
title:  Zookeeper for Docker 集群搭建
description: "以前我们搭建zookeeper集群时，都是要一个个去搭建、配置、启动，但总体部署起来还有有点麻烦的，尤其是当你只需要一个测试环境时，就更没有必要大费周章的去搭建zookeeper集群了，使用了Docker之后，大大简化的集群搭建的步骤，而且还可以重复利用配置文件。。"
modified: 2018-07-09 15:20:20
tags: [Docker,zookeeper,Cent OS,Linux,Docker Compose,Docker CE]
post_type: developer
categories: [zookeeper]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. 背景

### 1.1. 概述

原来搭建zookeeper集群时，都是要一个个去搭建、配置、启动，但总体部署起来还有有点麻烦的，尤其是当你只需要一个测试环境时，就更没有必要大费周章的去搭建zookeeper集群了，使用了Docker之后，大大简化的集群搭建的步骤，而且还可以重复利用配置文件。

尤其是在测试时，大大的方便了我们搭建集群的时间。

Docker 的安装详见《[Docker CE for Linux安装](http://huangxubo.me/blog/docker/docker-install/)》

### 1.2 . 环境

- Cent OS 7.3
- Docker 18.03.1-ce

## 2. zk镜像的基本操作

### 2.1 镜像下载

1. 这里我们使用zookeeper3.5的版本

```bash
docker pull zookeeper:3.5
```

2. 出现如下结果时，说明镜像已经下载完成

```bash
3.5: Pulling from library/zookeeper
ff3a5c916c92: Pull complete 
5de5f69f42d7: Pull complete 
fa7536dd895a: Pull complete 
644150d38454: Pull complete 
9ff28e2fa4ed: Pull complete 
51e97a19e3a8: Pull complete 
13b26111158e: Pull complete 
Digest: sha256:18b81f09a371e69be882dd759c93ad9d450d7c6a628458b2b38123c078ba01ae
Status: Downloaded newer image for zookeeper:3.5
```

### 2.2 启动

1. 运行如下命令启动一个zookeeper实例,默认端口2181

```bash
docker run --name my_zk -d zookeeper:3.5
```

2. 查看运行日志

```bash
docker logs -f my_zk
```

3. 输出如下,说明启动成功

```bash
ZooKeeper JMX enabled by default
Using config: /conf/zoo.cfg
2018-04-06 14:26:29,648 [myid:] - INFO  [main:QuorumPeerConfig@117] - Reading configuration from: /conf/zoo.cfg
2018-04-06 14:26:29,651 [myid:] - INFO  [main:QuorumPeerConfig@317] - clientPort is not set
2018-04-06 14:26:29,651 [myid:] - INFO  [main:QuorumPeerConfig@331] - secureClientPort is not set
2018-04-06 14:26:29,655 [myid:] - WARN  [main:QuorumPeerConfig@590] - No server failure will be tolerated. You need at least 3 servers.
    [省略若干... ]
2018-04-06 14:26:30,164 [myid:1] - INFO  [QuorumPeer[myid=1](plain=/0.0.0.0:2181)(secure=disabled):ContainerManager@64] - Using checkIntervalMs=60000 maxPerMinute=10000
```

### 2.3 使用 ZK 命令行客户端连接 ZK

因为刚才我们启动的那个 ZK 容器并没有绑定宿主机的端口, 因此我们不能直接访问它. 但是我们可以通过 Docker 的 link 机制来对这个 ZK 容器进行访问. 执行如下命令:

```bash
docker run -it --rm --link my_zk:my_zk2 zookeeper:3.5 zkCli.sh -server my_zk2
```

这个命令的含义是:

- 启动一个 `zookeeper` 镜像, 并运行这个镜像内的 `zkCli.sh` 命令, 命令参数是 `"-server my_zk2"`
- 将我们先前启动的名为 `my_zk` 的容器连接(link) 到我们新建的这个容器上, 并将其主机名命名为 `my_zk2`

## 3. zk 集群

## 3.1 配置集群

因为一个一个地启动 zk 太麻烦了, 所以为了方便起见, 我直接使用 docker-compose 来启动 zk 集群.

1. 首先创建一个名为 docker-compose.yml 的文件, 其内容如下:

```yml
version: '2'
services:
    zoo1:
        image: zookeeper:3.5
        restart: always
        container_name: zoo1
        ports:
            - "2181:2181"
        environment:
            ZOO_MY_ID: 1
            ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888

    zoo2:
        image: zookeeper:3.5
        restart: always
        container_name: zoo2
        ports:
            - "2182:2181"
        environment:
            ZOO_MY_ID: 2
            ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888

    zoo3:
        image: zookeeper:3.5
        restart: always
        container_name: zoo3
        ports:
            - "2183:2181"
        environment:
            ZOO_MY_ID: 3
            ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888
```

这个配置文件会告诉 Docker 分别运行三个 zookeeper 镜像, 并分别将本地的 2181, 2182, 2183 端口绑定到对应的容器的2181端口上.
`ZOO_MY_ID` 和 `ZOO_SERVERS` 是搭建 ZK 集群需要设置的两个环境变量, 其中 `ZOO_MY_ID` 表示 zk 服务的 id, 它是1-255 之间的整数, 必须在集群中唯一. `ZOO_SERVERS` 是 zk 集群的主机列表.

2. 接着我们在 docker-compose.yml 当前目录下运行如下命令,就可以启动 zk 集群了:

```bash
docker-compose -f docker-compose.yml -p zk_cluster up -d
```

- `-f` - 指定使用的 Compose 模板文件，默认为compose.yml ，可以多次指定
- `-p` - 指定项目名称，默认将使用所在目录名称作为项目名
- `-d` - 在后台运行服务容器,一般推荐生产环境下使用,如果不加此参数通过`Ctrl+C`停止命令时,所有容器将会停止

> 注：如果出现以下错误，参考《[Docker CE for Linux安装](http://huangxubo.me/blog/docker/docker-install/)》的3.3开启Docker Remote API。
>
>
> ```bash
> ERROR: Couldn't connect to Docker daemon at http+docker://localhost - is > it running?
>
> If it's at a non-standard location, specify the URL with the DOCKER_HOST > environment variable.
> ```

3. 执行上述命令成功后, 接着在另一个终端中运行 docker-compose ps 命令可以查看启动的 zk 容器:

```bash
>> docker-compose -p zk_cluster ps  

Name              Command               State                     Ports                   
------------------------------------------------------------------------------------------
zoo1   /docker-entrypoint.sh zkSe ...   Up      0.0.0.0:2181->2181/tcp, 2888/tcp, 3888/tcp
zoo2   /docker-entrypoint.sh zkSe ...   Up      0.0.0.0:2182->2181/tcp, 2888/tcp, 3888/tcp
zoo3   /docker-entrypoint.sh zkSe ...   Up      0.0.0.0:2183->2181/tcp, 2888/tcp, 3888/tcp

```

### 3.2 使用 Docker 命令行客户端连接 zk 集群

通过 `docker-compose ps` 命令, 我们知道启动的 zk 集群的三个主机名分别是 zoo1, zoo2, zoo3, 因此我们分别 `link` 它们即可:

```bash
docker run -it --rm \
        --link zoo1:zk1 \
        --link zoo2:zk2 \
        --link zoo3:zk3 \
        --net zkcluster_default \
        zookeeper zkCli.sh -server zk1:2181,zk2:2181,zk3:2181
```

### 3.3 通过本地主机连接 ZK 集群

因为我们分别将 zoo1, zoo2, zoo3 的 2181 端口映射到了 本地主机的2181, 2182, 2183 端口上, 因此我们使用如下命令即可连接 zk 集群了:

```bash
zkCli.sh -server localhost:2181,localhost:2182,localhost:2183
```

> 注: `zkCli.sh` 工具需要到[Zookeeper 官网](http://zookeeper.apache.org/)下载安装包里面会有

### 3.4 查看集群

我们可以通过 `nc` 命令连接到指定的 zk 服务器, 然后发送 `stat` 可以查看 zk 服务的状态, 例如:

```bash
>> echo stat | nc 127.0.0.1 2181
Zookeeper version: 3.4.11-37e277162d567b55a07d1755f0b31c32e93c01a0, built on 11/01/2017 18:06 GMT
Clients:
 /172.18.0.1:57924[0](queued=0,recved=1,sent=0)

Latency min/avg/max: 0/11/87
Received: 10
Sent: 9
Connections: 1
Outstanding: 0
Zxid: 0x100000003
Mode: follower
Node count: 4
```

```bash
>> echo stat | nc 127.0.0.1 2182
Zookeeper version: 3.4.11-37e277162d567b55a07d1755f0b31c32e93c01a0, built on 11/01/2017 18:06 GMT
Clients:
 /172.18.0.1:58984[0](queued=0,recved=1,sent=0)

Latency min/avg/max: 0/0/0
Received: 1
Sent: 0
Connections: 1
Outstanding: 0
Zxid: 0x100000004
Mode: follower
Node count: 4
```

```bash
>> echo stat | nc 127.0.0.1 2183
Zookeeper version: 3.4.11-37e277162d567b55a07d1755f0b31c32e93c01a0, built on 11/01/2017 18:06 GMT
Clients:
 /172.18.0.1:42570[0](queued=0,recved=1,sent=0)

Latency min/avg/max: 4/9/15
Received: 3
Sent: 2
Connections: 1
Outstanding: 0
Zxid: 0x100000004
Mode: leader
Node count: 4
```

通过上面的输出, 我们可以看到, zoo1, zoo2 都是 follower, 而 zoo3 是 leader, 因此证明了我们的 zk 集群确实是搭建起来了.

### 3.5 停止和关闭集群

停止集群
```
docker-compose -p zk_cluster stop
```

删除集群

```bash
docker-compose -p zk_cluster rm
```

## 4. zk的其它环境变量

- `ZOO_TICK_TIME` 默认 2000. ZooKeeper的 `tickTime`

- `ZOO_INIT_LIMIT` 默认 5. ZooKeeper的 `initLimit`

- `ZOO_SYNC_LIMIT` 默认 2. ZooKeeper的 `syncLimit`

- `ZOO_MAX_CLIENT_CNXNS` 默认 60. ZooKeeper的 `maxClientCnxns`

**参考资料**

1. [Zookeeper镜像文档](https://docs.docker.com/samples/library/zookeeper/)
