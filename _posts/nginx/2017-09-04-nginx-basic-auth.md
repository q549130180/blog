---
layout: post
title:  Nginx 设置 HTTP Basic 基本验证
description: "实现对Nginx静态资源的基本认证。"
modified: 2017-09-04 13:20:20
tags: [Nginx,http Server,location,rewrite]
post_type: developer
series: Nginx系列文章
blogid: 201709040001
categories: [Nginx ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. BASIC认证概述

在HTTP协议进行通信的过程中，HTTP协议定义了基本认证过程以允许HTTP服务器对WEB浏览器进行用户身份证的方法，当一个客户端向HTTP服务 器进行数据请求时，如果客户端未被认证，则HTTP服务器将通过基本认证过程对客户端的用户名及密码进行验证，以决定用户是否合法。客户端在接收到HTTP服务器的身份认证要求后，会提示用户输入用户名及密码，然后将用户名及密码以BASE64加密，加密后的密文将附加于请求信息中， 如当用户名为anjuta，密码为：123456时，客户端将用户名和密码用“：”合并，并将合并后的字符串用BASE64加密为密文，并于每次请求数据 时，将密文附加于请求头（Request Header）中。HTTP服务器在每次收到请求包后，根据协议取得客户端附加的用户信息（BASE64加密的用户名和密码），解开请求包，对用户名及密码进行验证，如果用 户名及密码正确，则根据客户端请求，返回客户端所需要的数据;否则，返回错误代码或重新要求客户端提供用户名及密码。

## 2. nginx basic auth指令

1. auth_basic
- 语法:       `auth_basic string | off;`
- 默认值:     `auth_basic off;`
- 配置段:     `http, server, location, limit_except`
- 默认表示不开启认证，后面如果跟上字符，这些字符会在弹窗中显示。


2. auth_basic_user_file
- 语法:      `auth_basic_user_file file;`
- 默认值:     `—`
- 配置段:     `http, server, location, limit_except`
- 用户密码文件，文件内容类似如下：

```
ttlsauser1:password1
ttlsauser2:password2:comment
```


## 3. 编辑配置文件

`vim conf/nginx.conf`

```nginx
location ~* /static/ {
        root   html;
        index  static.html;
        auth_basic "Restricted";
        auth_basic_user_file /home/quizgo/programs/nginx-1.10.2/conf/htpasswd;
        autoindex on;  #启用目录浏览
        autoindex_exact_size off;  #显示出文件的大概大小，单位是kB或者MB或者GB
        autoindex_localtime on;  #显示的文件时间为文件的服务器时间
}
```

“Restricted" 单词将会出现在第一次访问Nginx站点的弹出框内。

## 4. 生成密码

执行命令：`printf "admin:$(openssl passwd -crypt 123456)\n" >>conf/htpasswd`

`cat conf/htpasswd`

```
admin:CRUBApRA2yXEk
```

重启Nginx

```
sbin/nginx -s reload
```

## 5. 验证

在浏览器中输入对应的网址，则会出现如下所示

![Alt text]({{site.url}}/images/posts_image/nginx-auth-2017_09_04_0001.png)
