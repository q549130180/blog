---
layout: post
title:  Apache Server搭建文件(图片)服务器
description: "使用Apache Server搭建文件服务器(图片服务器)，指定特定的目录，直接使用http方式进行访问."
modified: 2016-05-26 17:20:20
tags: [Apache,Apache Server]
post_type: developer
categories: [Apache ]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---



# apache搭建文件服务器

## 一、环境

- OS:Cent OS 7
- apache:httpd-2.4.20


## 二、安装

### 1.安装依赖

```
yum install apr apr-util
yum install pcre-devel openssl-devel
```


**apr安装**

官网：http://apr.apache.org/

```
tar -zxvf apr-1.5.2.tar.gz
cd apr-1.5.2
./configure --prefix=/staples/apr
make && make install
```




**apr-util安装**

官网：http://apr.apache.org/

```
tar -zxvf apr-util-1.5.4.tar.gz
cd apr-util-1.5.4
./configure --prefix=/staples/apr-util --with-apr=/staples/apr/
make && make install
```


### 2.httpd安装

```
tar -zxvf httpd-2.4.20.tar.gz
cd httpd-2.4.20
./configure                           \
       --with-apr=/staples/apr           \
       --with-apr-util=/staples/apr-util \
       --prefix=/staples/apachehttpd \
       --enable-so                \
       --enable-ssl               \
       --enable-cgi               \
       --enable-rewrite           \
       --with-zlib                \
       --with-pcre                \
       --with-mpm=prefork         \
       --enable-modules=most      \
       --enable-mpms-shared=all

make && make install
```

以下为几个主要的配置项说明：

- --sysconfdir=/etc/httpd24  指定配置文件路径
- --enable-so  启动模块动态装卸载
- --enable-ssl 编译ssl模块
- --enable-cgi 支持cgi机制（能够让静态web服务器能够解析动态请求的一个协议）
- --enable-rewrite  支持url重写     --Author : Leshami
- --with-zlib  支持数据包压缩       --Blog   : http://blog.csdn.net/leshami
- --with-pcre  支持正则表达式
- --with-apr=/usr/local/apr  指明依赖的apr所在目录
- --with-apr-util=/usr/local/apr-util/  指明依赖的apr-util所在的目录
- --enable-modules=most      启用的模块
- --with-mpm=prefork         指明httpd的工作方式为prefork

### 3.编辑配置文件

```
vim /staples/apachehttpd/conf/httpd.conf
```

1. 将`DocumentRoot "/staples/apachehttpd/htdocs"`的值改为你自己的文件存放路径(`DocumentRoot "/staples/fileServer"`)

2. `<Directory "/staples/apachehttpd/htdocs">`同样改为文件的存放路径

3. 在最后一行添加：`AddDefaultCharset utf-8`,解决乱码问题

4. 将htdocs文件夹下的index.html删除或改为index.html.bak

5. 更改文件夹权限：`chmod -R 777 /staples/ftpServer`

```
cd /staples/apachehttpd/bin
```

6. 启动：`apachectl start`

7. 访问:127.0.0.1:80就可以查看fileServer文件夹下的目录结构

8. 127.0.0.1:80/123.jpg就可以直接访问文件

9. 停止：`apachectl stop`
