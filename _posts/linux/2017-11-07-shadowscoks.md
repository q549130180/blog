---
layout: post
title:  使用VPS搭建Shadowscoks代理
description: "使用海外VPS搭建Shadowscoks代理服务器，实现访问Google等网站。"
modified: 2017-11-07 15:20:20
tags: [Shadowscoks,VPS,代理,linux]
post_type: developer
blogid: 201711070002
categories: [linux ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 概述

作为一个技术人员, 最常用的就是Google、StackOverflow、Github这些网站, 工作期间几乎每分钟都在用。另外,偶尔也上上Facebook、YouTube, 娱乐一下自己。所以这个时候我们就需要使用代理了。


## 2. 开干

### 2.1 购买服务器

首先要购买一台服务器，选择阿里云的海外服务器也可以，或者选择一些海外的VPS供应商，比如[linode][1]、[vultr][2]、[DigitalOcean][3],这里我使用的VPS是Linode的VPS,一般如果只是用作代理服务器的话,配置选择`1核CPU``1GB内存`就够了，一个月也就5刀,操作系统选择CentOS 7。


### 2.2 搭建Shadowscoks代理服务

1.安装Shdowsocks服务端

```
# 安装pip
yum install python-pip

# 使用pip安装shadowsocks
pip install shadowsocks
```

注:如果在安装python-pip时提示没有包的话，先更新yum源，再进行安装，（[更新方法请参考《Cent OS 安装epel源》]({{ site.url }}/cent%20os/centos7-epel/)）

2.配置Shdowsocks服务

```conf
{
	"server":"ip-addr",
	"server_port":443,
	"local_address":"127.0.0.1",
	"local_port":1080,
	"password":"passwd",
	"timeout":300,
	"method":"aes-256-cfb",
	"fast_open":false,
	"workers":5
}
```

- 注意修改 `server` 和 `password`;
- `workers` 表示启动的进程数量。
- `server_port` 强烈建议使用443端口, 其它端口容易被查封。


3.启动服务
然后使用以下命令启动: `ssserver -c /etc/shadowsocks.json -d start`


## 3. Mac 使用客户端

下载地址：[Shadowscoks客户端][4] ，Mac和Windows都有(IOS可以在App Store下载Wingy或Potatso List)。

以Mac为例
![Alt text]({{site.url}}/images/posts_image/shadowsocks_2017-11-07_123456.jpg)
设置好直接开启服务就可以了。

Mac下给终端使用代理的方法：

```shell
alias setproxy='export http_proxy=http://127.0.0.1:1087 https_proxy=http://127.0.0.1:1087'
alias unsetproxy='unset http_proxy https_proxy'
```

这样需要使用代理时，输入`setproxy`，不需要时`unsetproxy`就可以了，但只局限于http代理。

## 4. Linux 客户端

### 4.1 安装配置Shdowsocks

在linux上客户端和服务端使用的是一个程序，所以使用 2.2 中的Shdowsocks服务端安装方法安装Shdowsocks即可。

创建配置文件`vim shadowsocks.json`

```
{
  "server":"server_ip",
  "local_address": "127.0.0.1",
  "local_port":1080,
  "server_port":server_port,
  "password":"server_password",
  "timeout":300,
  "method":"aes-256-cfb"
}
```

参数说明：

- `server` 服务器器的ip地址
- `local_address` 本地地址
- `local_port` 本地端口，一般是1080
- `server_port` 服务器对外开放的端口
- `password` 服务器设置的密码
- `timeout` 超时重连
- `method` 默认: “aes-256-cfb”

启动

- 启动：`sudo sslocal -c /etc/shadowsocks.json -d start`
- 停止：`sudo sslocal -c /etc/shadowsocks.json -d stop`
- 重启(修改配置要重启才生效)：`sudo sslocal -c /etc/shadowsocks.json -d restart`

配置开启启动

创建配置文件`sudo vim /etc/systemd/system/shadowsocks.service`

填写一下内容

```
[Unit]
Description=Shadowsocks Client Service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/sslocal -c /etc/shadowsocks.json

[Install]
WantedBy=multi-user.target
```
 > 把`/etc/shadowsocks.json`修改为你的`shadowsocks.json`的路径

配置生效：`systemctl enable /etc/systemd/system/shadowsocks.service`


测试

运行 `curl --socks5 127.0.0.1:1080 http://httpbin.org/ip`，如果返回你的 ss 服务器 ip 则测试成功：

```
{
  "origin": "x.x.x.x"       #你的 ss 服务器 ip
}
```

### 4.2 安装配置Proxychains4

因为SS走的是socks5代理,但命令行一般都是http或https所以要使用工具转化一下，所以[Proxychains4][5]就是一个很好的Linux代理工具

安装配置

```
git clone https://github.com/rofl0r/proxychains-ng.git
cd proxychains-ng
./configure
sudo make
sudo make install
sudo cp src/proxychains.conf /etc/proxychains.conf
cd .. && rm -rf proxychains-ng
```

再修改proxychains4的配置:`vim /etc/proxychains.conf`

将`socks4 127.0.0.1 9095`改为`socks5 127.0.0.1 1080`

验证`proxychains4 curl ip.sb`

### 4.3 Privoxy

[Privoxy][6]与Proxychains4是相同类型的工具，都是把socks5转为http或https，只是使用的方式不一样，可以根据具体情况进行选择


安装`sudo yum install privoxy `

配置`sudo vim /etc/privoxy/config`

填写一下内容`1080`为Socks5的端口，8118为[Privoxy][6]的端口

```
forward-socks5t   /   127.0.0.1:1080 .
listen-address  localhost:8118
```

启动`sudo service privoxy restart`

编辑`sudo vim /etc/profile`

添加一下内容

```
alias setproxy='export http_proxy=http://127.0.0.1:8118 https_proxy=http://127.0.0.1:8118'
alias unsetproxy='unset http_proxy https_proxy'
```

刷新环境变量`source /etc/profile`

执行`setproxy`开启代理,`unsetproxy`关闭代理

执行`curl ip.cn`查看结果



[1]:https://www.linode.com/
[2]:https://www.vultr.com/
[3]:https://www.digitalocean.com/
[4]:https://shadowsocks.org/en/index.html
[5]:https://github.com/rofl0r/proxychains-ng
[6]:www.privoxy.org
