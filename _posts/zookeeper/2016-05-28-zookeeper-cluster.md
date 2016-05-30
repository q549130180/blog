---
layout: post
title:  Zookeeper伪分布式集群安装及使用
description: "对Zookeeper布式集群安装及使用."
modified: 2016-05-28 15:20:20
tags: [zookeeper]
post_type: developer
categories: [zookeeper ]
image:
  feature: abstract-10.jpg
  credit:
  creditlink:
---


## 1. zookeeper介绍

ZooKeeper是一个为分布式应用所设计的分布的、开源的协调服务，它主要是用来解决分布式应用中经常遇到的一些数据管理问题，简化分布式应用协调及其管理的难度，提供高性能的分布式服务。ZooKeeper本身可以以Standalone模式安装运行，不过它的长处在于通过分布式ZooKeeper集群（一个Leader，多个Follower），基于一定的策略来保证ZooKeeper集群的稳定性和可用性，从而实现分布式应用的可靠性。

ZooKeeper是作为分布式协调服务，是不需要依赖于Hadoop的环境，也可以为其他的分布式环境提供服务。


## 2. Redis 集群环境说明

### 环境

- OS:Cent OS 7.0
- Java: 1.7 64-Bit Server VM


## 3. zookeeper单节点安装Standalones模式

下载ZooKeeper

官网：https://zookeeper.apache.org/

解压：

```
tar -zxvf zookeeper-3.4.8.tar.gz
```

修改配置文件conf/zoo.cfg

```
# 创建配置文件及数据文件夹
mkdir /snow/programs/zoo/zk0
cd zk0
mkdir conf data
cd /snow/programs/zoo/zookeeper-3.4.8

cp conf/zoo_sample.cfg ../zk0/conf/zoo.cfg

vim conf/zoo.cfg

tickTime=2000
initLimit=10
syncLimit=5
dataDir=/snow/programs/zoo/zk0/data
clientPort=2181
```

这样我们就已经配置好了ZooKeeper的单节点

启动Zookeeper

```
bin/zkServer.sh start ../zk0/conf/zoo.cfg

ZooKeeper JMX enabled by default
Using config: ../zk0/conf/zoo.cfg
Starting zookeeper ... STARTED

# zk的服务显示为QuorumPeerMain
[root@snow zookeeper-3.4.8]# jps
14844 Jps
14124 Bootstrap
14825 QuorumPeerMain

# 查看运行状态
[root@snow zookeeper-3.4.8]# bin/zkServer.sh status ../zk0/conf/zoo.cfg
ZooKeeper JMX enabled by default
Using config: ../zk0/conf/zoo.cfg
Mode: standalone
```

单节点的时，Mode会显示为standalone

停止ZooKeeper服务

```
[root@snow zookeeper-3.4.8]# bin/zkServer.sh stop ../zk0/conf/zoo.cfg
ZooKeeper JMX enabled by default
Using config: ../zk0/conf/zoo.cfg
Stopping zookeeper ... STOPPED
```

**注：** 如果只是单节点启动也可以不用建立zk0文件夹，直接在zookeeper-3.4.8/conf下复制、修改配置文件即可。

## 4. Zookeeper伪分布式集群安装

所谓 “伪分布式集群” 就是在，在一台PC中，启动多个ZooKeeper的实例。“完全分布式集群” 是每台PC，启动一个ZooKeeper实例。
由于我的测试环境PC数量有限，所以在一台PC中，启动3个ZooKeeper的实例。

创建环境目录

```
cd /snow/programs/zoo
mkdir zk1
cd zk1
mkdir conf data
cp -rf zk1/ zk2/
cp -rf zk1/ zk3/

#新建myid文件
echo "1" > zk1/data/myid
echo "2" > zk2/data/myid
echo "3" > zk3/data/myid

cp conf/zoo_sample.cfg ../zk1/conf/zoo.cfg
cp conf/zoo_sample.cfg ../zk2/conf/zoo.cfg
cp conf/zoo_sample.cfg ../zk3/conf/zoo.cfg
```

分别修改配置文件
修改：dataDir,clientPort
增加：集群的实例，server.X，”X”表示每个目录中的myid的值
以其中一个节点为例，其它节点只是修改dataDir,clientPort

```
vim zk1/conf/zoo.cfg

tickTime=2000
initLimit=10
syncLimit=5
dataDir=/snow/programs/zoo/zk1/data
clientPort=2181
server.1=10.0.2.15:2888:3888
server.2=10.0.2.15:2889:3889
server.3=10.0.2.15:2890:3890
```

参数说明：

- tickTime：这个时间是作为 Zookeeper 服务器之间或客户端与服务器之间维持心跳的时间间隔，也就是每个 tickTime 时间就会发送一个心跳。
- dataDir：顾名思义就是 Zookeeper 保存数据的目录，默认情况下，Zookeeper 将写数据的日志文件也保存在这个目录里。
- clientPort：这个端口就是客户端连接 Zookeeper 服务器的端口，Zookeeper 会监听这个端口，接受客户端的访问请求。
- initLimit：这个配置项是用来配置 Zookeeper 接受客户端（这里所说的客户端不是用户连接 Zookeeper 服务器的客户端，而是 Zookeeper 服务器集群中连接到 Leader 的 Follower 服务器）初始化连接时最长能忍受多少个心跳时间间隔数。当已经超过 10 个心跳的时间（也就是 tickTime）长度后 Zookeeper 服务器还没有收到客户端的返回信息，那么表明这个客户端连接失败。总的时间长度就是 5*2000=10 秒
- syncLimit：这个配置项标识 Leader 与 Follower 之间发送消息，请求和应答时间长度，最长不能超过多少个 tickTime 的时间长度，总的时间长度就是 2*2000=4 秒
- server.A=B：C：D：其中 A 是一个数字，表示这个是第几号服务器；B 是这个服务器的 ip 地址；C 表示的是这个服务器与集群中的 Leader 服务器交换信息的端口；D 表示的是万一集群中的 Leader 服务器挂了，需要一个端口来重新进行选举，选出一个新的 Leader，而这个端口就是用来执行选举时服务器相互通信的端口。如果是伪集群的配置方式，由于 B 都是一样，所以不同的 Zookeeper 实例通信端口号不能一样，所以要给它们分配不同的端口号。


3个节点的ZooKeeper集群配置完成之后，接下来我们的启动服务。

启动集群

```
bin/zkServer.sh start ../zk1/conf/zoo.cfg
bin/zkServer.sh start ../zk2/conf/zoo.cfg
bin/zkServer.sh start ../zk3/conf/zoo.cfg

[root@snow zookeeper-3.4.8]# jps
16217 Jps
14124 Bootstrap
16133 QuorumPeerMain
16104 QuorumPeerMain
16176 QuorumPeerMain

# 查看节点状态
[root@snow zookeeper-3.4.8]# bin/zkServer.sh status ../zk1/conf/zoo.cfg   
ZooKeeper JMX enabled by default
Using config: ../zk1/conf/zoo.cfg
Mode: follower
[root@snow zookeeper-3.4.8]# bin/zkServer.sh status ../zk2/conf/zoo.cfg  
ZooKeeper JMX enabled by default
Using config: ../zk2/conf/zoo.cfg
Mode: leader
[root@snow zookeeper-3.4.8]# bin/zkServer.sh status ../zk3/conf/zoo.cfg  
ZooKeeper JMX enabled by default
Using config: ../zk3/conf/zoo.cfg
Mode: follower
```

我们可以看到zk2是leader，zk1和zk3是follower

**注：** 如果在使用status命令中遇到如下错误，需安装nc

```
JMX enabled by default
Using config: /staples/zoo/zk3/zookeeper-3.3.3/bin/../conf/zoo.cfg
Error contacting service. It is probably not running.
```


安装nc：`yum install nc`


## 5. Zookeeper命令行操作

我们通过客户端连接ZooKeeper的集群，我们可以任意的zookeeper是进行连接。


```
# zkCli.sh -server 10.0.2.15:2181

Connecting to 10.0.2.15:2181
2016-04-24 10:32:26,814 [myid:] - INFO  [main:Environment@100] - Client environment:zookeeper.version=3.4.8--1, built on 02/06/2016 03:18 GMT
2016-04-24 10:32:26,824 [myid:] - INFO  [main:Environment@100] - Client environment:host.name=snow
2016-04-24 10:32:26,824 [myid:] - INFO  [main:Environment@100] - Client environment:java.version=1.7.0_79
2016-04-24 10:32:26,830 [myid:] - INFO  [main:Environment@100] - Client environment:java.vendor=Oracle Corporation
2016-04-24 10:32:26,830 [myid:] - INFO  [main:Environment@100] - Client environment:java.home=/snow/programs/jdk1.7.0_79/jre
2016-04-24 10:32:26,830 [myid:] - INFO  [main:Environment@100] - Client environment:java.class.path=/snow/programs/zoo/zookeeper-3.4.8/bin/../build/classes:/snow/programs/zoo/zookeeper-3.4.8/bin/../build/lib/*.jar:/snow/programs/zoo/zookeeper-3.4.8/bin/../lib/slf4j-log4j12-1.6.1.jar:/snow/programs/zoo/zookeeper-3.4.8/bin/../lib/slf4j-api-1.6.1.jar:/snow/programs/zoo/zookeeper-3.4.8/bin/../lib/netty-3.7.0.Final.jar:/snow/programs/zoo/zookeeper-3.4.8/bin/../lib/log4j-1.2.16.jar:/snow/programs/zoo/zookeeper-3.4.8/bin/../lib/jline-0.9.94.jar:/snow/programs/zoo/zookeeper-3.4.8/bin/../zookeeper-3.4.8.jar:/snow/programs/zoo/zookeeper-3.4.8/bin/../src/java/lib/*.jar:/snow/programs/zoo/zookeeper-3.4.8/bin/../conf:.:/snow/programs/jdk1.7.0_79/lib/dt.jar:/snow/programs/jdk1.7.0_79/lib/tools.jar
2016-04-24 10:32:26,831 [myid:] - INFO  [main:Environment@100] - Client environment:java.library.path=/usr/java/packages/lib/amd64:/usr/lib64:/lib64:/lib:/usr/lib
2016-04-24 10:32:26,831 [myid:] - INFO  [main:Environment@100] - Client environment:java.io.tmpdir=/tmp
2016-04-24 10:32:26,831 [myid:] - INFO  [main:Environment@100] - Client environment:java.compiler=<NA>
2016-04-24 10:32:26,831 [myid:] - INFO  [main:Environment@100] - Client environment:os.name=Linux
2016-04-24 10:32:26,831 [myid:] - INFO  [main:Environment@100] - Client environment:os.arch=amd64
2016-04-24 10:32:26,832 [myid:] - INFO  [main:Environment@100] - Client environment:os.version=3.10.0-327.13.1.el7.x86_64
2016-04-24 10:32:26,832 [myid:] - INFO  [main:Environment@100] - Client environment:user.name=root
2016-04-24 10:32:26,832 [myid:] - INFO  [main:Environment@100] - Client environment:user.home=/root
2016-04-24 10:32:26,832 [myid:] - INFO  [main:Environment@100] - Client environment:user.dir=/snow/programs/zoo/zookeeper-3.4.8/bin
2016-04-24 10:32:26,836 [myid:] - INFO  [main:ZooKeeper@438] - Initiating client connection, connectString=10.0.2.15:2181 sessionTimeout=30000 watcher=org.apache.zookeeper.ZooKeeperMain$MyWatcher@3bae7fff
Welcome to ZooKeeper!
2016-04-24 10:32:26,916 [myid:] - INFO  [main-SendThread(10.0.2.15:2181):ClientCnxn$SendThread@1032] - Opening socket connection to server 10.0.2.15/10.0.2.15:2181. Will not attempt to authenticate using SASL (unknown error)
2016-04-24 10:32:26,947 [myid:] - INFO  [main-SendThread(10.0.2.15:2181):ClientCnxn$SendThread@876] - Socket connection established to 10.0.2.15/10.0.2.15:2181, initiating session
JLine support is enabled
2016-04-24 10:32:27,063 [myid:] - INFO  [main-SendThread(10.0.2.15:2181):ClientCnxn$SendThread@1299] - Session establishment complete on server 10.0.2.15/10.0.2.15:2181, sessionid = 0x154460893a00000, negotiated timeout = 30000

WATCHER::

WatchedEvent state:SyncConnected type:None path:null
[zk: 10.0.2.15:2181(CONNECTED) 0]

```

集群已连接，下面我们要使用一下，ZooKeeper的命令行操作。

命令行操作

通过help打印命令行帮助

```
[zk: 10.0.2.15:2181(CONNECTED) 0] help
ZooKeeper -server host:port cmd args
        connect host:port
        get path [watch]
        ls path [watch]
        set path data [version]
        rmr path
        delquota [-n|-b] path
        quit
        printwatches on|off
        create [-s] [-e] path data acl
        stat path [watch]
        close
        ls2 path [watch]
        history
        listquota path
        setAcl path acl
        getAcl path
        sync path
        redo cmdno
        addauth scheme auth
        delete path [version]
        setquota -n|-b val path
[zk: 10.0.2.15:2181(CONNECTED) 1]
```

ZooKeeper的结构，很像是目录结构，我们看到了像ls这样熟悉的命令。

```
# ls，查看/目录内容
[zk: 10.0.2.15:2181(CONNECTED) 1] ls
[zk: 10.0.2.15:2181(CONNECTED) 2] ls /
[zookeeper]

# create，创建一个node节点
[zk: 10.0.2.15:2181(CONNECTED) 3] create /node zktest
Created /node

# ls再查看/目录
[zk: 10.0.2.15:2181(CONNECTED) 5] ls /
[node, zookeeper]

# get,查看/node节点的数据信息
[zk: 10.0.2.15:2181(CONNECTED) 6] get /node
zktest
cZxid = 0x200000002
ctime = Sun Apr 24 10:35:06 CST 2016
mZxid = 0x200000002
mtime = Sun Apr 24 10:35:06 CST 2016
pZxid = 0x200000002
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 6
numChildren = 0

# set, 修改数据
[zk: 10.0.2.15:2181(CONNECTED) 8] set /node myzk
cZxid = 0x200000002
ctime = Sun Apr 24 10:35:06 CST 2016
mZxid = 0x200000004
mtime = Sun Apr 24 10:37:33 CST 2016
pZxid = 0x200000002
cversion = 0
dataVersion = 2
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 4
numChildren = 0

# get,再查看/node的数据信息，已改为myzk
[zk: 10.0.2.15:2181(CONNECTED) 9] get /node
myzk
cZxid = 0x200000002
ctime = Sun Apr 24 10:35:06 CST 2016
mZxid = 0x200000004
mtime = Sun Apr 24 10:37:33 CST 2016
pZxid = 0x200000002
cversion = 0
dataVersion = 2
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 4
numChildren = 0

# delete，删除/node
[zk: 10.0.2.15:2181(CONNECTED) 10] delete /node
[zk: 10.0.2.15:2181(CONNECTED) 11] ls /
[zookeeper]

# quit，退出客户端连接
[zk: 10.0.2.15:2181(CONNECTED) 12] quit
Quitting...
2016-04-24 10:39:24,008 [myid:] - INFO  [main:ZooKeeper@684] - Session: 0x154460893a00000 closed
2016-04-24 10:39:24,013 [myid:] - INFO  [main-EventThread:ClientCnxn$EventThread@519] - EventThread shut down for session: 0x154460893a00000
```
