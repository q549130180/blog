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


### 3.mod_jk 插件安装

mod_jk插件下载[地址](http://tomcat.apache.org/connectors-doc/),下载：tomcat-connectors-1.2.41-src.tar.gz


编译安装mod_jk模块：

```bash
tar -zxvf tomcat-connectors-1.2.41-src.tar.gz

cd tomcat-connectors-1.2.41-src/
cd native/

./configure --with-apxs=/snow/apachehttpd/bin/apxs
#这里指定的是apache安装目录中apxs的位置，这个apxs方便我们动态加载模块

make && make install

# 将mod_jk.so文件复制到apache的modules文件夹下
cp apache-2.0/mod_jk.so /snow/apachehttpd/modules/

```


### 4.Apache Server配置文件

在`/snow/apachehttpd/conf`下面建立两个配置文件`mod_jk.conf`和`workers.properties`。

新建mod_jk文件`vim mod_jk.conf`,并添加以下内容:

```bash

# 指出mod_jk模块工作所需要的工作文件workers.properties的位置
JkWorkersFile /snow/apachehttpd/conf/workers.properties

# Where to put jk logs
JkLogFile /snow/apachehttpd/logs/mod_jk.log

# Set the jk log level[debug/error/info]
JkLogLevel info

# Select the log format
JkLogStampFormat "[%a%b %d %H:%M:%S %Y]"

# JkOptions indicate tosend SSL KEY SIZE,
JkOptions +ForwardKeySize +ForwardURICompat -ForwardDirectories

# JkRequestLogFormat setthe request format
JkRequestLogFormat "%w%V %T"

# 将所有servlet 和jsp请求通过ajp13的协议送给Tomcat，让Tomcat来处理
# JkMount /servlet/* worker1
# JkMount /*.jsp worker1

# 集群模式下，将所有请求发送给负载平衡器
JkMount /* loadbalancer
```

新建workers文件`vim workers.properties`,并添加以下内容:

```bash


worker.list=worker1,worker2,loadbalancer

worker.worker1.port=8009          # tomcat1 ajp工作端口
worker.worker1.host=10.10.5.131   # tomcat1 的工作地址
worker.worker1.type=ajp13         # 类型
worker.worker1.lbfactor=100       # 负载平衡因数，指工作负荷
# worker.worker1.cachesize=10
# worker.worker1.cache_timeout=600
# worker.worker1.socket_keepalive=1
# worker.worker1.socket_timeout=300

worker.worker2.port=8009          # tomcat1 ajp工作端口
worker.worker2.host=10.10.5.132   # tomcat1 的工作地址
worker.worker2.type=ajp13         # 类型
worker.worker2.lbfactor=100       # 负载平衡因数，指工作负荷


worker.loadbalancer.type=lb       # 负载平衡器
worker.loadbalancer.balanced_workers=worker1,worker2
worker.loadbalancer.sticky_session=true
# 此处指定集群是否需要会话复制，如果设为true，则表明为会话粘性，不进行会话复制，当某用户的请求第一次分发到哪台Tomcat后，后继的请求会一直分发到此Tomcat服务器上处理；如果设为false，则表明需求会话复制。

worker.loadbalancer.sticky_session_force=true  
# 如果上面的sticky_session设为true时，建议此处也设为true，此参数表明如果集群中某台Tomcat服务器在多次请求没有响应后，是否将当前的请求，转发到其它Tomcat服务器上处理；此参数在sticky_session=true时，影响比较大，会导致转发到其它Tomcat服务器上的请求，找不到原来的session，所以如果此时请求中有读取session中某些信息的话，就会导致应用的null异常

```

`workers.properties`配置文件[tomcat官方文档](http://tomcat.apache.org/connectors-doc/reference/workers.html)


修改`http.conf`,在文件末尾加入以下内容:

{% highlight bash %}

LoadModule jk_module modules/mod_jk.so
Include /snow/apachehttpd/conf/mod_jk.conf

 {% endhighlight %}