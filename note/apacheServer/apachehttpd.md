---
layout: post
title: Apache 与 Tomcat 服务器集成和集群配置
description: ""
modified: 2016-07-06 15:20:20
tags: [Apache,Apache Server,Tomcat]
post_type: developer
series:
categories: [Apache]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## Apache 与 Tomcat 服务器集成和集群配置


## 一、集成原因

Tomcat的功能分为以下两个主要部分：

- 提供Servlet/JSP容器
- 向客户端提供静态资源(HTML或图像等)的响应

在提供静态资源响应的功能方面，Tomcat都远不如专业的HTTP服务器，如Apache服务器，Nginx等。
因此，实际应用中，经常让Tomcat只作为Servlet/JSP的容器，而提供静态资源响应的功能则交给专业的HTTP服务器来完成。
还有在高并发的情况下，单个的Tomcat无法提供大量的http请求，需要使用Apache分发到多个Tomcat组成的集群，这样达到更大并发性的效果。


## 一、环境

OS: Cent OS 7
JDK: 1.7
Tomcat： apache-tomcat-7.0.65
Apache Server: httpd-2.4.20


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

[Apache Server官网](https://httpd.apache.org/)，下载源码包。


mod_jk插件下载[地址](http://tomcat.apache.org/connectors-doc/),下载：tomcat-connectors-1.2.41-src.tar.gz


```
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


```

编译安装mod_jk模块

```
 tar -zxvf tomcat-connectors-1.2.41-src.tar.gz

 cd tomcat-connectors-1.2.41-src/
 cd native/

./configure --with-apxs=/staples/apachehttpd/bin/apxs
#这里指定的是apache安装目录中apxs的位置，这个apxs方便我们动态加载模块

make

# 将mod_jk.so文件复制到apache的modules文件夹下
cp apache-2.0/mod_jk.so /staples/apachehttpd/modules/

```

### httpd配置

在/staples/apachehttpd/conf下面建立两个配置文件mod_jk.conf和workers.properties。

```
# vi mod_jk.conf

# 添加以下内容：

# 指出mod_jk模块工作所需要的工作文件workers.properties的位置
JkWorkersFile /staples/apachehttpd/conf/workers.properties

# Where to put jk logs
JkLogFile /staples/apachehttpd/logs/mod_jk.log

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

```
# vi workers.properties
# 添加以下内容：

worker.list=worker1,worker2,loadbalancer

worker.worker1.port=8009       # tomcat1 ajp工作端口
worker.worker1.host=10.10.5.131  # tomcat1 的工作地址
worker.worker1.type=ajp13      # 类型
worker.worker1.lbfactor=100    # 负载平衡因数，指工作负荷
# worker.worker1.cachesize=10
# worker.worker1.cache_timeout=600
# worker.worker1.socket_keepalive=1
# worker.worker1.socket_timeout=300

worker.worker2.port=8009       # tomcat1 ajp工作端口
worker.worker2.host=10.10.5.132  # tomcat1 的工作地址
worker.worker2.type=ajp13      # 类型
worker.worker2.lbfactor=100    # 负载平衡因数，指工作负荷


worker.loadbalancer.type=lb    # 负载平衡器
worker.loadbalancer.balanced_workers=worker1,worker2
worker.loadbalancer.sticky_session=false # 粘性复制为false，即不会进行会话复制。即一个客户端访问了tomcat1，则始终由它来服务
worker.loadbalancer.sticky_session_force=false  # 粘性复制为false，该参数影响不大。如果粘性复制为true，sticky_session_force为true，客户会收到500的错误。如果为false，负载平衡器会重新请求正常的服务器。


```
workers.properties配置文件tomcat官方文档http://tomcat.apache.org/connectors-doc/reference/workers.html




修改http.conf,在文件末尾加入以下内容

```
LoadModule jk_module modules/mod_jk.so
Include /staples/apachehttpd/conf/mod_jk.conf
```

## 三、与tomcat集成


jvmRoute="worker1"

修改Tomcat的conf/server.xml文件中的AJP连接器的端口，确保它们和workers.properties文件中的配置对应。此外，在使用了loadbalancer后，要求worker的名字和Tomcat的server.xml文件中的<Engine>元素的jvmRoute属性一致

Tomcat修改如下：

```
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />

    <!-- Define an AJP 1.3 Connector on port 8009 -->
    <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />

    <Engine name="Catalina" defaultHost="localhost" jvmRoute="worker1" >

```

```
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />

    <!-- Define an AJP 1.3 Connector on port 8009 -->
    <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />

    <Engine name="Catalina" defaultHost="localhost" jvmRoute="worker2" >

```



tomcat集群管理器

```
<Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster" channelSendOptions="8">
<Manager className="org.apache.catalina.ha.session.DeltaManager"
	expireSessionsOnShutdown="false"
	notifyListenersOnReplication="true"/>
<Channel className="org.apache.catalina.tribes.group.GroupChannel">
	<Membership className="org.apache.catalina.tribes.membership.McastService"
		bind="127.0.0.1"
		address="228.0.0.4"
		port="45564"
		frequency="500"
		dropTime="3000"/>
	<Receiver className="org.apache.catalina.tribes.transport.nio.NioReceiver"
		address="auto"
		port="4000"
		autoBind="100"
		selectorTimeout="5000"
		maxThreads="6"/>
	<Sender className="org.apache.catalina.tribes.transport.ReplicationTransmitter">
		<Transport className="org.apache.catalina.tribes.transport.nio.PooledParallelSender"/>
	</Sender>
	<Interceptor className="org.apache.catalina.tribes.group.interceptors.TcpFailureDetector"/>
	<Interceptor className="org.apache.catalina.tribes.group.interceptors.MessageDispatch15Interceptor"/>
</Channel>
<Valve className="org.apache.catalina.ha.tcp.ReplicationValve" filter=""/>
<Valve className="org.apache.catalina.ha.session.JvmRouteBinderValve"/>

<Deployer className="org.apache.catalina.ha.deploy.FarmWarDeployer"
	tempDir="/tmp/war-temp"
	deployDir="/tmp/war-deploy"
	watchDir="/tmp/war-listen"
	watchEnabled="false"/>
<ClusterListener
	className="org.apache.catalina.ha.session.JvmRouteSessionIDBinderListener"/>
<ClusterListener
	className="org.apache.catalina.ha.session.ClusterSessionListener"/>

</Cluster>


```
