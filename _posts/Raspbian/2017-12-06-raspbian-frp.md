---
layout: post
title:  使用frp搭建内网穿透服务
description: "frp 是一个可用于内网穿透的高性能的反向代理应用，支持 tcp, udp, http, https 协议。本文主要讲述通过frp实现在外网通过ssh访问内网的树莓派"
modified: 2017-12-06 13:20:20
tags: [frp,linux Server,linux,Raspbian Pi]
post_type: developer
blogid: 201712060001
categories: [linux ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---



## 1. 什么是frp
[frp][3] 是一个高性能的反向代理应用，可以帮助您轻松地进行内网穿透，对外网提供服务，支持 tcp,udp, http, https 等协议类型，并且 web 服务支持根据域名进行路由转发。实际上frp的官方[中文文档][1]里面已经有比较详细的教程了，这里只是对具体的环境进行内网穿透，达到在外网可以通过ssh连接到内网的服务器。

## 2. 准备

1. 一台有公网IP的VPS主机
2. 内网服务器(我使用的是树莓派)



## 3. 开始使用

### 3.1 服务端(外网主机)

1.根据操作系统可以在官网GitHub的[Release][2]页面找到相应的版本下载(我这里是CentOS7的系统，所以选择amd64的版本)。

```
wget https://github.com/fatedier/frp/releases/download/v0.14.0/frp_0.14.0_linux_amd64.tar.gz
```

2.解压

```shell
tar -zxvf frp_0.14.0_linux_amd64.tar.gz
cd frp_0.14.0_linux_amd64

# 外网主机作为服务端，可以删掉不必要的客户端文件
rm frpc
rm frpc.ini
```

3.`frps.ini`为服务端的配置文件，在默认的配置文件里已经有相关的配置了

执行 `vim frps.ini`配置如下

```ini
[common]
bind_port = 7000
```

`[common]`为必须的配置，`bind_port`为绑定frp的服务端端口,如果需要修改，则可以进行修改。

保存配置文件

4.后台启动服务`nohup ./frps -c ./frps.ini &`



### 3.2 内网主机(树莓派)

1.我这里使用的是树莓派，所以下载的是arm的版本，如果是其他的操作系统，请下载相应的其它版本。

```shell
wget https://github.com/fatedier/frp/releases/download/v0.14.0/frp_0.14.0_linux_arm.tar.gz
```

2.解压

```shell
tar -zxvf frp_0.14.0_linux_arm.tar.gz
cd frp_0.14.0_linux_arm

# 内网的刻画端，就可以删掉不必要的服务端的文件
rm frps
rm frps.ini
```
3.执行 `vim frpc.ini`配置如下

```ini
[common]
server_addr = x.x.x.x
server_port = 7000

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 6000
```

`[common]`中的`server_addr`填frp服务端的ip（也就是外网主机的IP），`server_port`填frp服务端的`bind_prot`。

`[ssh]`中为本地的配置，`local_port`是本地的ssh端口,`remote_port`为服务端监听的端口


4.后台启动服务`nohup ./frpc -c ./frpc.ini &`


## 4. 连接

通过 ssh 访问内网机器，假设用户名为 test：
`ssh -oPort=6000 test@x.x.x.x`



[1]: https://github.com/fatedier/frp/blob/master/README_zh.md
[2]: https://github.com/fatedier/frp/releases
[3]: https://github.com/fatedier/frp
