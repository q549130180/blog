---
layout: post
title: Apache与Tomcat服务器集成和集群配置
description: "Apache与Tomcat服务器集成和集群配置,通过mod_jk的方式进行Tomcat和Apache的集成"
modified: 2016-07-20 15:20:20
tags: [Apache,Apache Server,Tomcat]
post_type: developer
categories: [Apache]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 一、集成原因

Tomcat的功能分为以下两个主要部分：

- 提供Servlet/JSP容器
- 向客户端提供静态资源(HTML或图像等)的响应

在提供静态资源响应的功能方面，Tomcat都远不如专业的HTTP服务器，如Apache服务器，Nginx等。
因此，实际应用中，经常让Tomcat只作为Servlet/JSP的容器，而提供静态资源响应的功能则交给专业的HTTP服务器来完成。
还有在高并发的情况下，单个的Tomcat无法提供大量的http请求，需要使用Apache分发到多个Tomcat组成的集群，这样达到更大并发性的效果。


## 二、集成原理

1、Tomcat服务器是通过Connector连接器组件与客户端程序建立连接，它负责接收客户端的请求，并把Tomcat服务器的响应结果发送给客户端。在`server.xml`中默认存在以下2个连接器组件：

```xml
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />

<!-- Define an AJP 1.3 Connector on port 8009 -->
<Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
```

第一个连接器是HTTP连接器，监听8080端口，负责建立HTTP链接。在使用Tomcat作为HTTP服务器时就是用的该连接器。

第二个连接器是AJP连接器，监听8009端口，负责和其它的HTTP服务器建立连接。与其它服务器集成时就是用到这个连接器。


2、JK插件

Tomcat提供了专门的JK插件来负责与其它HTTP服务器的通信，该插件需要安置在对应的HTTP服务器上，它根据预先配置好的URL映射信息，决定是否把客户请求转发给Tomcat服务器。



## 三、环境

- OS: Cent OS 7
- JDK: 1.7
- Tomcat： apache-tomcat-7.0.65
- Apache Server: httpd-2.4.20


## 四、安装

### 1.安装依赖

```
yum install apr apr-util pcre-devel openssl-devel
```


**apr安装**

官网：http://apr.apache.org/

```
tar -zxvf apr-1.5.2.tar.gz
cd apr-1.5.2
./configure --prefix=/snow/apr
make && make install
```




**apr-util安装**

官网：http://apr.apache.org/

```
tar -zxvf apr-util-1.5.4.tar.gz
cd apr-util-1.5.4
./configure --prefix=/snow/apr-util --with-apr=/snow/apr/
make && make install
```

### 2.httpd安装


[Apache Server官网](https://httpd.apache.org/)，下载源码包。

编译安装：

```bash
./configure                           \
       --with-apr=/snow/apr           \
       --with-apr-util=/snow/apr-util \
       --prefix=/snow/apachehttpd \
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
