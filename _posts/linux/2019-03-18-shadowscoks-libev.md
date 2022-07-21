---
layout: post
title: 使用VPS搭建Shadowscoks-libev代理
description: "shadowsocks-libev 是 shadowsocks 的 C 实现版本,这里我们将介绍使用源码来编译安装 shadowsocks-libev 以及 simple-obfs，simple-obfs是混淆shadowsocks的一种工具，还将介绍一些优化相关的内容。"
modified: 2019-03-18 15:20:20
tags: [Cent OS,Linux,Shadowscoks,shadowsocks-libev,VPS,代理]
post_type: developer
blogid: 201903180002
categories: [linux]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. 概述

### 1.1 简介

[shadowsocks-libev][1] 是 shadowsocks 的 C 实现版本,这里我们将介绍使用源码来编译安装 shadowsocks-libev 以及 simple-obfs，simple-obfs是混淆shadowsocks的一种工具，还将介绍一些优化相关的内容


### 1.2 环境

- Cent OS 7.5

## 2. shadowsocks-libev

### 2.1 基础环境安装

```
sudo yum install epel-release -y
sudo yum update -y
sudo yum install gcc gettext autoconf libtool automake make pcre-devel asciidoc xmlto c-ares-devel libev-devel libsodium-devel mbedtls-devel -y
```

### 2.2 获取源码

```
git clone https://github.com/shadowsocks/shadowsocks-libev.git
cd shadowsocks-libev
git submodule update --init --recursive
```

### 2.3 开始编译

```
./autogen.sh && ./configure --prefix=/usr && make
sudo make install
```

### 2.4 获取配置文件


```
sudo mkdir -p /etc/shadowsocks-libev
sudo cp ./debian/config.json /etc/shadowsocks-libev/config.json
```

## 3. simple-obfs

### 3.1 简介

Shadowsocks 组织下的 [simple-obfs][2] 项目就是用于混淆 Shadowsocks 流量的工具，思路是在原来的 Shadowsocks 流量上叠加一层加密，使得 GFW 无法判断是否正常的网站流量。它支持以插件的模式和 Shadowsocks 配合使用，也支持单独运行，还能与 web 服务器同时共存。由于条件限制，所以选择插件模式来运行 simple-obfs。

### 3.2 安装基础环境

```
sudo yum install zlib-devel openssl-devel -y
```

### 3.3 编译和安装 simple-obfs

```
git clone https://github.com/shadowsocks/simple-obfs.git
cd simple-obfs
git submodule update --init --recursive
./autogen.sh
./configure && make
sudo make install
```

## 4. 服务端配置

### 4.1 配置文件

编辑配置文件 `sudo vim /etc/shadowsocks-libev/config.json`


```json
{
    "server":"0.0.0.0",
    "server_port":8388,
    "local_port":1080,
    "password":"123456",
    "timeout":300,
    "method":"aes-256-cfb",
    "fast_open":false,
    "plugin":"obfs-server",
    "plugin_opts":"obfs=tls;failover=127.0.0.1:4431"
}
```

- `plugin` : `obfs-server` 的执行文件路径，一般可以直接用 obfs-server。
- `plugin_opts` : 混淆参数，`obfs` 有 `tls` 和 `http` 两种类型,相比 `http`，`tls` 更具隐蔽性。
- `failover` : 然后可以在 `4431` 端口跑个 `https` 的站点。这样访问 `443` 端口的时候，如果发现不是 shadowsocks 的流量就自动 `failover` 到 `4431` 的网站。

### 4.2 客户端obfs配置

客户端配置
- 插件：`obfs-local`
- 插件选项：`obfs=tls;obfs-host=bing.com`

混淆域名，使用混淆时伪装的域名，一般选择大型企业，流量出入较大、CDN等未被墙的域名作为混淆域名(如伪装的特定端口下的IP或域名来免流)，常用的混淆域名有这些

关于 Mac 和 Windows 等系统客户端的配置请参考[《使用VPS搭建Shadowscoks代理》](http://lingfeng.me/blog/linux/shadowscoks/)

### 4.3 开机启动

创建文件 `sudo vim /etc/systemd/system/shadowsocks.service`,写入以下内容

```
[Unit]
Description=Shadowsocks
After=network.target

[Service]
ExecStart=/usr/bin/ss-server -c /etc/shadowsocks-libev/config.json
Restart=on-abort

[Install]
WantedBy=multi-user.target
```


- `sudo systemctl start shadowsocks` 启动
- `sudo systemctl enable shadowsocks` 开机启动
- `sudo systemctl status shadowsocks` 查看状态


## 5. 使用 HAProxy 代理，共用 443 端口（选配）

### 5.1 HAProxy 配置

如果 shadowsocks 使用 443 端口的话，那么我们本机的 Nginx 就无法使用 443 端口了，所以这里我们来使用 HAProxy 来做代理实现 nginx 和 shadowsocks 共用 443 端口，以下是 HAProxy 的配置

```
frontend main
	bind 0.0.0.0:443	# 设置监听所有IP的443端口
	mode tcp
	tcp-request inspect-delay 5s # 设置等待数据传输的最大超时时间
	tcp-request content accept if { req.ssl_hello_type 1 }
	acl web-app req_ssl_sni -i a.example.me
	acl web-app req_ssl_sni -i b.example.me
    acl shadowsocks-app req_ssl_sni -i bing.com
	use_backend nginx if web-app
	use_backend ss-out if shadowsocks-app
	default_backend ss-out #不满足则响应backend的默认页面

backend nginx # nginx 作用域
	mode tcp
	option tcp-check
	server web1 :4431 check send-proxy

backend ss-out
	mode tcp
	server D-T-us0 127.0.0.1:8388
	server D-T-us1 127.0.0.1:8388 backup
```

### 5.2 Nginx 配置文件配置

```
server {
    listen 4431 ssl proxy_protocol;
    server_name a.example.me;
    set_real_ip_from 127.0.0.1; # HAProxy IP
    real_ip_header proxy_protocol;
    ssl on;
    root html;
    index index.html index.htm;
    ssl_certificate   /aaaa.pem;
    ssl_certificate_key  /bbb.key;
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    location / {
        proxy_pass        http://127.0.0.1:8888;
        proxy_set_header  Host  $host;
        proxy_set_header  X-Forwarded-Host $host:443;
        proxy_set_header  X-Forwarded-Server $host;
        proxy_set_header  X-Forwarded-Proto $scheme;
        proxy_set_header  X-Real-IP  $proxy_protocol_addr;
        proxy_set_header  X-Forwarded-For  $proxy_protocol_addr;
    }
}
```


## 6. Shadowsocks 优化

### 6.1 修改文件句柄数限制

首先使用 `ulimit -a` 查看 `user resource limits`，若 `open files` 一项的值较小（通常是 1024），则进行以下操作。

增加进程打开文件句柄数量，以便更好的处理大量的 TCP 连接。

编辑文件 `vim /etc/security/limits.conf` 增加以下两行

```
* soft nofile 51200
* hard nofile 51200
```


### 6.2 内核优化

编辑配置文件 `sudo vim /etc/sysctl.conf`,写入如下内容

```
fs.file-max = 1024000
#系统所有进程一共可以打开的句柄数(bytes)
kernel.msgmnb = 65536
#进程通讯消息队列的最大字节数(bytes)
kernel.msgmax = 65536
#进程通讯消息队列单条数据最大的长度(bytes)
kernel.shmmax = 68719476736
#内核允许的最大共享内存大小(bytes)
kernel.shmall = 4294967296
#任意时间内系统可以使用的共享内存总量(bytes)

net.core.rmem_max = 12582912
#设置内核接收Socket的最大长度(bytes)

net.core.wmem_max = 12582912
#设置内核发送Socket的最大长度(bytes)

net.ipv4.tcp_rmem = 10240 87380 12582912
#设置TCP Socket接收长度的最小值，预留值，最大值(bytes)

net.ipv4.tcp_rmem = 10240 87380 12582912
#设置TCP Socket发送长度的最小值，预留值，最大值(bytes)

net.ipv4.ip_forward = 1
#开启所有网络设备的IPv4流量转发，用于支持IPv4的正常访问

net.ipv4.tcp_syncookies = 1
#开启SYN Cookie，用于防范SYN队列溢出后可能收到的攻击

net.ipv4.tcp_tw_reuse = 1
#允许将等待中的Socket重新用于新的TCP连接，提高TCP性能

net.ipv4.tcp_tw_recycle = 0
#禁止将等待中的Socket快速回收，提高TCP的稳定性

net.ipv4.tcp_fin_timeout = 30
#设置客户端断开Sockets连接后TCP在FIN等待状态的实际(s)，保证性能

net.ipv4.tcp_keepalive_time = 1200
#设置TCP发送keepalive数据包的频率，影响TCP链接保留时间(s)，保证性能

net.ipv4.tcp_mtu_probing = 1
#开启TCP层的MTU主动探测，提高网络速度

net.ipv4.conf.all.accept_source_route = 1
net.ipv4.conf.default.accept_source_route = 1
#允许接收IPv4环境下带有路由信息的数据包，保证安全性

net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
#拒绝接收来自IPv4的ICMP重定向消息，保证安全性

net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.lo.send_redirects = 0
#禁止发送在IPv4下的ICMP重定向消息，保证安全性

net.ipv4.conf.all.rp_filter = 0
net.ipv4.conf.default.rp_filter = 0
net.ipv4.conf.lo.rp_filter = 0
#关闭反向路径回溯进行源地址验证(RFC1812)，提高性能

net.ipv4.icmp_echo_ignore_broadcasts = 1
#忽略所有ICMP ECHO请求的广播，保证安全性

net.ipv4.icmp_ignore_bogus_error_responses = 1
#忽略违背RFC1122标准的伪造广播帧，保证安全性

net.ipv6.conf.all.accept_source_route = 1
net.ipv6.conf.default.accept_source_route = 1
#允许接收IPv6环境下带有路由信息的数据包，保证安全性

net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
#禁止接收来自IPv6下的ICMPv6重定向消息，保证安全性

net.ipv6.conf.all.autoconf = 1
#开启自动设定本地连接地址，用于支持IPv6地址的正常分配

net.ipv6.conf.all.forwarding = 1
#开启所有网络设备的IPv6流量转发，用于支持IPv6的正常访问
```

执行 `sysctl -e -p` 生效


### 6.3 开启 TCP Fast Open

三次握手的过程中，当用户首次访问server时，发送syn包，server根据用户IP生成cookie，并与syn+ack一同发回client；client再次访问server时，在syn包携带TCP cookie；如果server校验合法，则在用户回复ack前就可以直接发送数据；否则按照正常三次握手进行。

TFO提高性能的关键是省去了热请求的三次握手，这在充斥着小对象的移动应用场景中能够极大提升性能。

TCP Fast Open 要求服务器和客户端都是 `Linux 3.7+` 的内核，需要的话可以参考我的另一篇文章[《Cnet OS 7 升级系统内核》](http://lingfeng.me/blog/cent%20os/centos-kernel/)

> 要求：系统内核版本 ≥ 3.7，shadowsocks-libev ≥ 3.0.4，Shadowsocks 服务端开启 TCP Fast Open

1.修改 `sudo vim /etc/sysctl.conf`，加入如下一行：


```
net.ipv4.tcp_fastopen = 3
```

2.执行如下命令使之生效 `sysctl -p`


3.编辑配置文件 `sudo vim /etc/shadowsocks-libev/config.json`


```    
"fast_open":true,
```


4.`sudo systemctl restart shadowsocks` 重启 shadowsocks

### 6.4 开启 Google BBR


在使用Google BBR之前，我们首先要了解它是什么。了解计算机网络的人都知道，在TCP连接中，由于需要维持连接的可靠性，引入了拥塞控制和流量管理的方法。Google BBR就是谷歌公司提出的一个开源TCP拥塞控制的算法。在最新的linux 4.9及以上的内核版本中已被采用。对于该算法的分析，ss不经过其它的任何的优化就能轻松的跑满带宽。（speedtest测试或fast测试）。由于Google BBR非常新，任何低于4.9的linux内核版本都需要升级到4.9及以上才能使用。

1.修改 `sudo vim /etc/sysctl.conf`，加入如下内容

```
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
```

2.执行如下命令使之生效 `sysctl -p`


3.执行 `sysctl net.ipv4.tcp_available_congestion_control`输出如下说明开启成功

```
net.ipv4.tcp_available_congestion_control = reno cubic bbr
```

4.重启系统 `reboot`



## 7. 更新升级

### 7.1 更新 ss-libev

```
systemctl stop shadowsocks
```

在 shadowsocks-libev 目录下：

```
git pull
./configure
make
make install
systemctl start shadowsocks
```

### 7.2 更新 obfs

```
systemctl stop shadowsocks
```

在 simple-obfs 目录下：

```
git pull
./configure
make
make install
systemctl start shadowsocks
```

##### 参考资料

- [simple-obfs 官方安装文档](https://github.com/shadowsocks/simple-obfs/blob/master/README.md)
- [如今我这样科学上网](https://medium.com/@unbiniliumm/%E5%A6%82%E4%BB%8A%E6%88%91%E8%BF%99%E6%A0%B7%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91-95187ef07ced)
- [shadowsocks 安装（Ubuntu , CentsOS 和 其他Linux 编译安装）](https://okayjam.com/index.php/2017/06/05/shadowsocks-%E5%AE%89%E8%A3%85%EF%BC%88ubuntu-centsos-%E5%92%8C-%E5%85%B6%E4%BB%96linux-%E7%BC%96%E8%AF%91%E5%AE%89%E8%A3%85%EF%BC%89/)
- [CentOS 7 下编译并安装 shadowsocks-libev 并启用 obfs 混淆](https://blog.chaos.run/dreams/centos-build-ss-libev/index.html)

[1]:://github.com/shadowsocks/shadowsocks-libev
[2]:https://github.com/shadowsocks/simple-obfs