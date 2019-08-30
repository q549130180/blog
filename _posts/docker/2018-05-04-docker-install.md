---
layout: post
title:  Docker CE for Linux 安装
description: "Docker 使用 Google 公司推出的 Go 语言 进行开发实现，基于 Linux 内核的 cgroup，namespace，以及 AUFS 类的 Union FS 等技术，对进程进行封装隔离，属于 操作 系统层面的虚拟化技术。由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容 器。最初实现是基于 LXC，从 0.7 版本以后开始去除 LXC，转而使用自行开发的 libcontainer，从 1.11 开始，则进一步演进为使用 runC 和 containerd。"
modified: 2018-05-04 15:20:20
tags: [Docker,Go,Cent OS,Linux,Docker Compose,Docker CE]
post_type: developer
series: Docker系列文章
categories: [Docker]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. 背景

### 1.1 概述

Docker 使用 Google 公司推出的 Go 语言 进行开发实现，基于 Linux 内核的 cgroup，namespace，以及 AUFS 类的 Union FS 等技术，对进程进行封装隔离，属于 操作 系统层面的虚拟化技术。由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容 器。最初实现是基于 LXC，从 0.7 版本以后开始去除 LXC，转而使用自行开发的 libcontainer，从 1.11 开始，则进一步演进为使用 runC 和 containerd。

Docker 在容器的基础上，进行了进一步的封装，从文件系统、网络互联到进程隔离等等，极 大的简化了容器的创建和维护。使得 Docker 技术比虚拟机技术更为轻便、快捷。

### 1.2 为什么要使用 Docker

作为一种新兴的虚拟化方式，Docker 跟传统的虚拟化方式相比具有众多的优势。

#### 1. 更高效的利用系统资源

由于容器不需要进行硬件虚拟以及运行完整操作系统等额外开销，Docker 对系统资源的利用 率更高。无论是应用执行速度、内存损耗或者文件存储速度，都要比传统虚拟机技术更高 效。因此，相比虚拟机技术，一个相同配置的主机，往往可以运行更多数量的应用。

#### 2. 更快速的启动时间

传统的虚拟机技术启动应用服务往往需要数分钟，而 Docker 容器应用，由于直接运行于宿主 内核，无需启动完整的操作系统，因此可以做到秒级、甚至毫秒级的启动时间。大大的节约 了开发、测试、部署的时间。

#### 3. 一致的运行环境

开发过程中一个常见的问题是环境一致性问题。由于开发环境、测试环境、生产环境不一 致，导致有些 bug 并未在开发过程中被发现。而 Docker 的镜像提供了除内核外完整的运行 时环境，确保了应用运行环境一致性，从而不会再出现 「这段代码在我机器上没问题啊」 这 类问题。

#### 4. 持续交付和部署

对开发和运维（DevOps）人员来说，最希望的就是一次创建或配置，可以在任意地方正常运 行。

使用 Docker 可以通过定制应用镜像来实现持续集成、持续交付、部署。开发人员可以通过 Dockerfile 来进行镜像构建，并结合 持续集成(Continuous Integration) 系统进行集成测试， 而运维人员则可以直接在生产环境中快速部署该镜像，甚至结合 持续部署(Continuous Delivery/Deployment) 系统进行自动部署。

而且使用 Dockerfile 使镜像构建透明化，不仅仅开发团队可以理解应用运行环境，也方便 运维团队理解应用运行所需条件，帮助更好的生产环境中部署该镜像。

#### 5. 更轻松的迁移

由于 Docker 确保了执行环境的一致性，使得应用的迁移更加容易。Docker 可以在很多平台 上运行，无论是物理机、虚拟机、公有云、私有云，甚至是笔记本，其运行结果是一致的。 因此用户可以很轻易的将在一个平台上运行的应用，迁移到另一个平台上，而不用担心运行 环境的变化导致应用无法正常运行的情况。

#### 6. 更轻松的维护和扩展

Docker 使用的分层存储以及镜像的技术，使得应用重复部分的复用更为容易，也使得应用的 维护更新更加简单，基于基础镜像进一步扩展镜像也变得非常简单。此外，Docker 团队同各 个开源项目团队一起维护了一大批高质量的 官方镜像，既可以直接在生产环境使用，又可以 作为基础进一步定制，大大的降低了应用服务的镜像制作成本。

#### 7. 对比传统虚拟机总结

特性 | 容器 | 虚拟机
--- | --- | ---
启动 | 秒级 | 分钟级
硬盘使用 | 一般为MB | 一般为GB
性能 | 接近原生 | 弱于
系统支持量 | 单机支持上千个容器 | 一般几十个

### 1.3 环境

- Cent OS 7
- Docker 18.03.0-ce

## 2. 卸载旧版本

老版本的Docker被称为docker或docker-engine。如果安装了这些版本，先卸载它们，以及相关的依赖项。

```bash
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine
```

## 3. 安装Docker

## 3.1 安装Docker yum源

在新主机上首次安装Docker CE之前，您需要设置Docker的yum源。之后，您可以从存储库安装和更新Docker。

**设置源**

##### 1. 安装所需要的包。`yum-utils`提供了`yum-config-manager`功能，而`devicemapper`存储驱动程序需要`device-mapper-persistent-data`和`lvm2`

```bash
sudo yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
```

##### 2. 使用下面的命令来设置稳定的yum源

```bash
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
```

### 3.2 安装 Docker CE

##### 1. 安装最新版本的Docker CE

```bash
sudo yum install docker-ce
```

已安装Docker，但未启动。

##### 2. 启动Docker

```bash
sudo systemctl start docker
```

##### 3. 使用阿里镜像加速器

由于国内的网络原因需要使用阿里的镜像加速器,登录自己的阿里云官网，找到镜像加速器，根据提示进行配置

![docker aliyun](http://image.huangxubo.me/images/docker/docker_2018_04_06_4852.jpg)

##### 4. 验证

```bash
sudo docker run hello-world
```

输入如下

```bash
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
ca4f61b1923c: Pull complete
Digest: sha256:97ce6fa4b6cdc0790cda65fe7290b74cfebd9fa0c9b8c38e979330d547d22ce1
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://cloud.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/engine/userguide/
```

##### 5. 执行`sudo docker version`

输出如下

```bash
Client:
 Version:       18.03.0-ce      # 客户端版本
 API version:   1.37
 Go version:    go1.9.4
 Git commit:    0520e24
 Built: Wed Mar 21 23:09:15 2018
 OS/Arch:       linux/amd64
 Experimental:  false
 Orchestrator:  swarm

Server:
 Engine:
  Version:      18.03.0-ce      # Docker-Engine版本
  API version:  1.37 (minimum version 1.12)
  Go version:   go1.9.4
  Git commit:   0520e24
  Built:        Wed Mar 21 23:13:03 2018
  OS/Arch:      linux/amd64
  Experimental: false
```

##### 6. 执行`sudo docker info`

输出如下

```bash
Containers: 0                   # 容器数
 Running: 0                     # 运行容器数
 Paused: 0                      # 暂停容器数
 Stopped: 0                     # 停止容器数
Images: 0
Server Version: 18.03.0-ce
Storage Driver: overlay2        # 存储去掉
 Backing Filesystem: xfs        # 磁盘文件系统格式
 Supports d_type: true
 Native Overlay Diff: false
Logging Driver: json-file
Cgroup Driver: cgroupfs
Plugins:
 Volume: local
 Network: bridge host macvlan null overlay
 Log: awslogs fluentd gcplogs gelf journald json-file logentries splunk syslog
Swarm: active
 NodeID: y6ulbxd4353ubvpi2p5g3d4zf
 Is Manager: true
 ClusterID: k19zirti3fcvq8fygqivg91lx
 Managers: 1
 Nodes: 2
 Orchestration:
  Task History Retention Limit: 5
 Raft:
  Snapshot Interval: 10000
  Number of Old Snapshots to Retain: 0
  Heartbeat Tick: 1
  Election Tick: 3
 Dispatcher:
  Heartbeat Period: 5 seconds
 CA Configuration:
  Expiry Duration: 3 months
  Force Rotate: 0
 Autolock Managers: false
 Root Rotation In Progress: false
 Node Address: 10.32.2.202
 Manager Addresses:
  10.32.2.202:2377
Runtimes: runc
Default Runtime: runc
Init Binary: docker-init
containerd version: cfd04396dc68220d1cecbe686a6cc3aa5ce3667c
runc version: 4fc53a81fb7c994640722ac585fa9ca548971871
init version: 949e6fa
Security Options:
 seccomp
  Profile: default
Kernel Version: 3.10.0-514.el7.x86_64
Operating System: CentOS Linux 7 (Core)
OSType: linux
Architecture: x86_64
CPUs: 8
Total Memory: 31.17GiB
Name: localhost
ID: E23S:ORX7:3KJA:2MPT:TRCU:VVAM:WOV6:6KUF:ABED:LWFQ:OHGJ:RQU6
Docker Root Dir: /var/lib/docker
Debug Mode (client): false
Debug Mode (server): false
Registry: https://index.docker.io/v1/
Labels:
Experimental: false
Insecure Registries:
 127.0.0.0/8
Live Restore Enabled: false
```

### 3.3 开启Docker Remote API

修改配置文件
```bash
vim /usr/lib/systemd/system/docker.service
```

找到`ExecStart=/usr/bin/dockerd`行，修改如下。

```bash
ExecStart=/usr/bin/dockerd  -H tcp://0.0.0.0:2375  -H unix:///var/run/docker.sock
```

编辑配置文件`vim /etc/profile`,写入一下内容,执行`source /etc/profile`刷新

```bash
export DOCKER_HOST=127.0.0.1:2375
```

执行命令

```bash
systemctl daemon-reload
systemctl restart docker
```

执行`curl http://127.0.0.1:2375/info`验证

输出如下

```json
{"ID":"HPZP:XIWJ:BZP7:YI47:UOLX:YLMM:LBF7:KV4E:Y2A7:ED6B:BHWB:FE4R","Containers":2,"ContainersRunning":0,"ContainersPaused":0,"ContainersStopped":2,"Images":2,"Driver":"overlay2","DriverStatus":[["Backing Filesystem","xfs"],["Supports d_type","true"],["Native Overlay Diff","true"]],"SystemStatus":null,"Plugins":{"Volume":["local"],"Network":["bridge","host","macvlan","null","overlay"],"Authorization":null,"Log":["awslogs","fluentd","gcplogs","gelf","journald","json-file","logentries","splunk","syslog"]},"MemoryLimit":true,"SwapLimit":true,"KernelMemory":true,"CpuCfsPeriod":true,"CpuCfsQuota":true,"CPUShares":true,"CPUSet":true,"IPv4Forwarding":true,"BridgeNfIptables":true,"BridgeNfIp6tables":true,"Debug":false,"NFd":20,"OomKillDisable":true,"NGoroutines":33,"SystemTime":"2018-04-08T15:41:52.725705339+08:00","LoggingDriver":"json-file","CgroupDriver":"cgroupfs","NEventsListener":0,"KernelVersion":"3.10.0-693.21.1.el7.x86_64","OperatingSystem":"CentOS Linux 7 (Core)","OSType":"linux","Architecture":"x86_64","IndexServerAddress":"https://index.docker.io/v1/","RegistryConfig":{"AllowNondistributableArtifactsCIDRs":[],"AllowNondistributableArtifactsHostnames":[],"InsecureRegistryCIDRs":["127.0.0.0/8"],"IndexConfigs":{"docker.io":{"Name":"docker.io","Mirrors":["https://0zs97su8.mirror.aliyuncs.com/"],"Secure":true,"Official":true}},"Mirrors":["https://0zs97su8.mirror.aliyuncs.com/"]},"NCPU":1,"MemTotal":1022570496,"GenericResources":null,"DockerRootDir":"/var/lib/docker","HttpProxy":"","HttpsProxy":"","NoProxy":"","Name":"localhost","Labels":[],"ExperimentalBuild":false,"ServerVersion":"18.03.0-ce","ClusterStore":"","ClusterAdvertise":"","Runtimes":{"runc":{"path":"docker-runc"}},"DefaultRuntime":"runc","Swarm":{"NodeID":"","NodeAddr":"","LocalNodeState":"inactive","ControlAvailable":false,"Error":"","RemoteManagers":null},"LiveRestoreEnabled":false,"Isolation":"","InitBinary":"docker-init","ContainerdCommit":{"ID":"cfd04396dc68220d1cecbe686a6cc3aa5ce3667c","Expected":"cfd04396dc68220d1cecbe686a6cc3aa5ce3667c"},"RuncCommit":{"ID":"4fc53a81fb7c994640722ac585fa9ca548971871","Expected":"4fc53a81fb7c994640722ac585fa9ca548971871"},"InitCommit":{"ID":"949e6fa","Expected":"949e6fa"},"SecurityOptions":["name=seccomp,profile=default"]}
```

### 3.4 设置开启启动

```bash
sudo systemctl enable docker.service
```

## 4. 安装 Docker Compose

##### 1. 运行此命令下载最新版本的Docker Compose

```bash
sudo curl -L https://github.com/docker/compose/releases/download/1.20.1/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
```

> 在上面写的命令是本博客撰写时的最新版本
>
> 上面的命令是一个例子，有可能会过时，为了确保使用最新的版本，请前往[Github Compose repository release][1]查看最新版本

##### 2. 给可执行文件添加权限

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

##### 3. 验证安装`docker-compose --version`

输出如下:

```bash
docker-compose version 1.20.1, build 5d8c71b
```

##### 参考资料:

1. [Docker 官方安装文档](https://docs.docker.com/install/linux/docker-ce/centos/)
2. [Docker Compose官网安装文档](https://docs.docker.com/compose/install/)

[1]:https://github.com/docker/compose/releases
