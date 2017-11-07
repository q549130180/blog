---
layout: post
title:  使用VPS搭建Shadowscoks代理
description: "使用海外VPS搭建Shadowscoks代理服务器，实现访问Google等网站。"
modified: 2017-11-07 15:20:20
tags: [Shadowscoks]
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


## 3. 使用客户端

下载地址：https://shadowsocks.org/en/index.html，Mac和Windows都有。

以Mac为例
![Alt text]({{site.url}}/images/posts_image/shadowsocks_2017-11-07_123456.jpg)
设置好直接开启服务就可以了。

Mac下给终端使用代理的方法：

```shell
alias setproxy='export http_proxy=http://127.0.0.1:1087 https_proxy=http://127.0.0.1:1087'
alias unsetproxy='unset http_proxy https_proxy'
```

这样需要使用代理时，输入`setproxy`，不需要时`unsetproxy`就可以了，但只局限于http代理。

[1]:https://www.linode.com/
[2]:https://www.vultr.com/
[3]:https://www.digitalocean.com/
