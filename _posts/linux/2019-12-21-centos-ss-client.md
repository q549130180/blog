---
layout: post
title:  Cnet OS 安装 Shadowscoks-libev 客户端
description: "之前我们介绍过 Shadowscoks-libev 服务端的安装，这里我们将介绍 Shadowscoks-libev 客户端的使用，其实服务端和客户端的程序都是一样的，只是启动命令不同而已。"
modified: 2019-12-21 10:20:20
tags: [linux,Shadowscoks,Cent OS,Shadowscoks,Shadowscoks-libev,Privoxy,VPS,代理]
post_type: developer
blogid: 201912210001
categories: [linux ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. 概述

### 1.1 简介

之前我们介绍过 Shadowscoks-libev 服务端的安装，这里我们将介绍 Shadowscoks-libev 客户端的使用，其实服务端和客户端的程序都是一样的，只是启动命令不同而已。

### 1.2 环境

- Cent OS 8

## 2. 安装配置

### 2.1 安装

Shadowscoks-libev 的安装可以参考 [《使用VPS搭建Shadowscoks-libev代理》](https://huangxubo.me/blog/linux/shadowscoks-libev/), 安装的方式都是一样的。

配置和启动方式请参考以下内容。


### 2.2 配置

```config
{
    "server":"x.x.x.x",			# 你的 ss 服务器 ip
    "server_port":443,			# 的你 ss 服务器端口
    "local_port":1080,			# 本地端口
    "password":"******",		# 连接 ss 密码
    "timeout":86400,			# 等待超时
    "method":"aes-256-cfb",		# 加密方式
    "plugin":"obfs-local",		# 混淆插件
    "plugin_opts":"obfs=tls;failover=bing.com"	# 插件配置
}
```


### 2.3 配置开机启动

创建文件 `sudo vim /etc/systemd/system/ss-local.service`, 写入以下内容

```
[Unit]
Description=Shadowsocks
After=network.target

[Service]
ExecStart=/usr/bin/ss-local -c /etc/shadowsocks-libev/config.json
Restart=on-abort

[Install]
WantedBy=multi-user.target
```

- `sudo systemctl start ss-local` 启动
- `sudo systemctl enable ss-local` 开机启动
- `sudo systemctl status ss-local` 查看状态

### 2.4 测试验证


运行 `curl --socks5 127.0.0.1:1080 http://httpbin.org/ip`，如果返回你的 ss 服务器 ip 则测试成功：

```json
{
  "origin": "x.x.x.x"    # 你的 ss 服务器 ip
}
```


## 3. Privoxy

### 3.1 简介

Shadowsocks 是一个 socket5 服务，我们需要使用 Privoxy 把流量转到 http 获 https 上。


### 3.2 下载


[Privoxy][1] 只能 使用 privoxy 用户运行，所以我们要新建立一个用户 `useradd privoxy`, 并切换到新用户下 `su privoxy`

下载源码

```
wget https://www.privoxy.org/sf-download-mirror/Sources/3.0.28%20%28stable%29/privoxy-3.0.28-stable-src.tar.gz
tar -zxvf privoxy-3.0.28-stable-src.tar.gz
cd privoxy-3.0.28-stable

```

privoxy-3.0.28-stable 是目前最新的稳定版，建议在下载前去 [Privoxy 官网下载页][2]检查一下版本。

### 3.3 安装


```
autoheader && autoconf
./configure
make -j2
sudo make install
```
> `make -j2` 表示可以多核编译，如果是单核 cpu 可以去掉

### 3.4 配置

编辑配置文件 `vim /usr/local/etc/privoxy/config`

```
listen-address 0.0.0.0:8118   # 8118 是默认端口，不用改，下面会用到
forward-socks5t / 127.0.0.1:1080 . # 这里的端口写 shadowsocks 的本地端口（注意最后那个 . 不要漏了）
```

### 3.5 启动

启动 `privoxy --user privoxy /usr/local/etc/privoxy/config`


### 3.6 配置环境变量


如果要让命令行也可以使用代理，需要添加环境变量，编辑文件 `vi /etc/profile`, 添加环境变量

```
export http_proxy=http://127.0.0.1:8118       #这里的端口和上面 privoxy 中的保持一致
export https_proxy=http://127.0.0.1:8118
```

刷新环境变量 `source /etc/profile`

### 3.7 验证


运行 `curl ipinfo.io/ip` 如果返回的是你服务器的 IP 说明可以生效了。


##### 参考资料

- [Privoxy 官网][1]
- [Privoxy 官网下载页][2]

[1]:https://www.privoxy.org/
[2]:https://www.privoxy.org/sf-download-mirror/Sources/



