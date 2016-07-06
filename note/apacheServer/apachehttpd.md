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


## 一、环境

## 二、安装与配置

官网：https://httpd.apache.org/

http://tomcat.apache.org/connectors-doc/
下载：tomcat-connectors-1.2.41-src.tar.gz


http://archive.apache.org/dist/tomcat/tomcat-connectors/jk/binaries/linux/jk-1.2.31/x86_64/

 mod_jk-1.2.31-httpd-2.2.x.so    


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



修改http.conf,在文件末尾加入以下内容
```
将Listen80 修改为 Listen 127.0.0.1:80

LoadModule jk_module modules/mod_jk.so
Include /staples/apachehttpd/conf/mod_jk.conf
```

## 三、与tomcat集成


jvmRoute="worker1"

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
