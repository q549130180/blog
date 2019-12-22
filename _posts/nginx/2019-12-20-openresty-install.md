---
layout: post
title:  OpenResty 编译安装
description: "OpenResty 也被称为 ngx_openresty，是一个基于 Nginx 与 Lua 的高性能 Web 平台，其内部集成了大量精良的 Lua 库、第三方的Nginx模块和大部分系统依赖包，用于方便地搭建能够处理超高并发、扩展性极高的动态 Web 应用、Web 服务和动态网关。OpenResty 不是 Nginx 的分支，它只是一个软件包。"
modified: 2019-12-20 15:20:20
tags: [Nginx,OpenResty,TCP]
post_type: developer
categories: [OpenResty]
blogid: 201912200001
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---


## 1. 概述

### 1.1 前言

[OpenResty][1] 也被称为 `ngx_openresty`，是一个基于 Nginx 与 Lua 的高性能 Web 平台，其内部集成了大量精良的 Lua 库、第三方的Nginx模块和大部分系统依赖包，用于方便地搭建能够处理超高并发、扩展性极高的动态 Web 应用、Web 服务和动态网关。OpenResty 不是 Nginx 的分支，它只是一个软件包。

OpenResty 允许开发人员使用 lua 编程语言构建现有的 Nginx 的 C 模块，支持高流量的应用程序。

OpenResty 的配置和 Nginx 都是一样的，所以这里只简单的介绍一下 OpenResty 的安装，配置等信息可以参考 Nginx 的文章

### 1.2 环境

- Cent OS 8.0

## 2. 安装

### 2.1 安装依赖

```
yum -y install gcc gcc-c++ make libtool zlib zlib-devel openssl openssl-devel pcre pcre-devel curl perl postgresql-devel
```

### 2.2 下载源码包

```
wget https://openresty.org/download/openresty-1.15.8.2.tar.gz
```

### 2.3 编译安装

```
./configure --prefix=/usr/local/openresty \
            --user=ling --group=ling \
            --with-luajit \
            --without-http_redis2_module \
            --with-http_iconv_module \
            --with-http_postgres_module \
            --with-http_stub_status_module \
            --with-http_gzip_static_module \
            --with-http_ssl_module \
            --with-stream \
            --with-http_v2_module \
            --with-http_realip_module
```

使用以下命令编译，如果是双核处理器使用`make -j2`

```
make
```

使用以下命令安装

```
sudo make install
```

## 2.4 配置开机启动
 
创建配置文件 `vim /usr/lib/systemd/system/nginx.service`, 写入以下内容

```
[Unit]
Description=nginx
After=network.target

[Service]
Type=forking
PIDFile=/usr/local/openresty/nginx/logs/nginx.pid
ExecStartPre=/usr/local/openresty/nginx/sbin/nginx -t
ExecStart=/usr/local/openresty/nginx/sbin/nginx
ExecReload=/usr/local/openresty/nginx/sbin/nginx -s reload
ExecStop=/usr/local/openresty/nginx/sbin/nginx -s stop
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

设置开机启动

```
systemctl daemon-reload
systemctl enable nginx.service
```

启动

```
systemctl start nginx.service
```

##### 参考资料

- [OpenResty 官网][1]
 
[1]:https://openresty.org/cn/