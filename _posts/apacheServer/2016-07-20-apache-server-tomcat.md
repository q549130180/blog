---
layout: post
title: Apache与Tomcat服务器集成和集群配置
description: "Apache与Tomcat服务器集成和集群配置,通过mod_jk的方式进行Tomcat和Apache的集成"
modified: 2016-07-20 15:20:20
tags: [Apache,Apache Server,Tomcat,httpd]
post_type: developer
categories: [Apache]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 一、集成原因

Tomcat的功能分为以下两个主要部分 ：

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


[Apache Server官网][1]，下载源码包。

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

mod_jk插件下载[地址][2],下载：tomcat-connectors-1.2.41-src.tar.gz


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

# 将所有servlet 和jsp请求通过ajp13的协议送给Tomcat，让Tomcat来处理(JkMount把匹配的转发到指定服务器 )
# JkMount /servlet/* worker1
# JkMount /*.jsp worker1


# JkUnMount把匹配的不转发到指定服务器.
# JkUnMount选项的级别高于JkMount.
# 单独有JkMount规则有效,但单独有JkUnMount无效,JkUnMount与JkMount要成对出现.
# JkUnMount /*.html worker1 #通过JkUnMount/*.html,表示所有*.html不交给worker1服务器处理

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

```bash
LoadModule jk_module modules/mod_jk.so
Include /snow/apachehttpd/conf/mod_jk.conf
```



### 5.Tomcat安装与配置

```bash

tar -zxvf apache-tomcat-7.0.65.tar.gz
cd apache-tomcat-7.0.65/

# 安装tomcat-native（不用单独下载，在tomcat的bin目录中自带）

cd bin/
tar -zxvf tomcat-native.tar.gz
cd tomcat-native-1.1.33-src/jni/native/
./configure                                         \
     --with-apr=/snwo/apr/bin/apr-1-config         \
     --with-ssl                                    \
     --with-java-home=/snwo/jdk1.7.0_79

make && make install

```

tomcat默认参数是为开发环境制定，而非适合生产环境，尤其是内存和线程的配置，默认都很低，容易成为性能瓶颈。下面是一些配置示例，需要根据实际需要更改。

Tomcat优化请具体参考[《Tomcat性能调优》]({{ site.url }}/apache/tomcat-tomcat/)

```

vim bin/setenv.sh


JAVA_OPTS="-XX:PermSize=128M -XX:MaxPermSize=256M -Xms1536M -Xmx2048M -verbosegc "
CATALINA_OPTS="-Dcom.sun.management.jmxremote.port=7091 -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.authenticate=false -Djava.rmi.server.hostname=192.168.10.100"
JAVA_HOME="/snwo/jdk1.7.0_79"
CATALINA_OPTS="$CATALINA_OPTS -Djava.library.path=/snwo/apr/lib"

chmod 755 bin/setenv.sh

```

bin目录下新建的可执行文件setenv.sh会由tomcat自动调用。上面的jmxremote.authenticate在正式环境中请务必设为true并设置用户名/密码，减少安全隐患，或者注释掉CATALINA_OPTS。（有时候出于性能调优的目的，才需要设置JMX）。对于具体的连接协议有不同的优化属性，参考如下：

对HTTP：

```xml
<Connector port="8080"
          protocol="org.apache.coyote.http11.Http11NioProtocol"
          URIEncoding="UTF-8"
          enableLookups="false"

          maxThreads="400"
          minSpareTheads="50"   
          acceptCount="400"
          acceptorThreadCount="2"              
          connectionTimeout="30000"
          disableUploadTimeout="true"

          compression="on"
          compressionMinSize="2048"
          maxHttpHeaderSize="16384"
          redirectPort="8443"
/>
```

对AJP：

```xml
<Connector port="8009"
          protocol="AJP/1.3"
          maxThreads="300"
          minSpareThreads="50"
          connectionTimeout="30000"
          keepAliveTimeout="30000"
          acceptCount="200"
          URIEncoding="UTF-8"
          enableLookups="false"
          redirectPort="8443" />
```


修改Tomcat的`conf/server.xml`文件中的AJP连接器的端口，确保它们和`workers.properties`文件中的配置对应。此外，在使用了loadbalancer后，要求`worker`的名字和Tomcat的`server.xml`文件中的`<Engine>`元素的`jvmRoute`属性一致

Tomcat修改如下：

```xml
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />

   <!-- Define an AJP 1.3 Connector on port 8009 -->
   <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />

   <Engine name="Catalina" defaultHost="localhost" jvmRoute="worker1" >

```

```xml
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />

   <!-- Define an AJP 1.3 Connector on port 8009 -->
   <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />

   <Engine name="Catalina" defaultHost="localhost" jvmRoute="worker2" >

```


测试页面

最后编辑Tomcat的配置文件server.xml，在HOST段中加入：

```xml

<Context path="" docBase="/apps/testapp/TEST" debug="0" reloadable="true" crossContext="true"/>

```

在`/apps/testapp/TEST`下建立一个`index.jsp`，启动Apache和Tomcat，用浏览器访问`http://localhost:80/`，应该可以看到正确的页面了。

index.jsp内容如下：

```java

<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*" %>
<html>
  <head>
    <title>Cluster App Test</title>
  </head>
<body>
Server Info:
    <%out.println(request.getLocalAddr() + " : " + request.getLocalPort()+"<br>");%>
    <%
         out.println("<br> ID " + session.getId()+"<br>");
         // 如果有新的 Session 属性设置
         String dataName = request.getParameter("dataName");
         if (dataName != null && dataName.length() > 0) {
            String dataValue = request.getParameter("dataValue");
            session.setAttribute(dataName, dataValue);
         }
         out.println("<b>Session 列表</b><br>");
         System.out.println("============================");
         Enumeration e = session.getAttributeNames();
         while (e.hasMoreElements()) {
            String name = (String)e.nextElement();
            String value = session.getAttribute(name).toString();
            out.println( name + " = " + value+"<br>");
                System.out.println( name + " = " + value);
          }
    %>
    <form action="index.jsp" method="POST">
        CRM <br>
        名称:<input type=text size=20 name="dataName">
        <br>
        值:<input type=text size=20 name="dataValue">
        <br>
        <input type=submit>
    </form>
</body>
</html>

```





<div class="elementHide" >
tomcat集群管理器

```xml
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
</div>





[1]: https://httpd.apache.org/
[2]: http://tomcat.apache.org/connectors-doc/     
