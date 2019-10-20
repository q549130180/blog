---
layout: post
title:  Nginx配置TCP请求转发
description: "通过Nginx对tcp连接进行请求转发."
modified: 2018-05-03 15:20:20
tags: [Nginx,TCP]
post_type: developer
categories: [Nginx]
blogid: 201805030001
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---

## 1. 概述

通过Nginx对tcp连接进行请求转发.

## 2. 编译安装 Stream 组建

```bash
./configure --prefix=/usr/local/nginx --with-stream  --with-stream_ssl_module
```

## 3. 配置Nginx的配置文件`conf/nginx.conf`

```conf
stream {
    upstream proxy_card {
        # simple round-robin  转发IP和端口
        server 192.168.1.12:12340;
        server 192.168.1.13:12340;
        #check interval=3000 rise=2 fall=5 timeout=1000;
        #check interval=3000 rise=2 fall=5timeout=1000
        #check interval=3000 rise=2 fall=5timeout=1000
        #check_http_send "GET /HTTP/1.0\r\n\r\n";
        #check_http_expect_alive http_2xxhttp_3xx;
    }
    server {
        listen 12340; #监听端口
        proxy_pass proxy_card;  #转发请求
    }
}
```

## 4. 重启Nginx

```bash
./nginx -s stop
./nginx
```
