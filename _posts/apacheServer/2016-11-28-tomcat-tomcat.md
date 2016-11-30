---
layout: post
title: Tomcat性能调优
description: "Tomcat性能调优，主要针对Java虚拟机(JVM)的优化以及Tomcat容器自身的优化。"
modified: 2016-11-30 15:20:20
tags: [Apache,Apache Server,Tomcat]
post_type: developer
categories: [Tomcat]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 一、概述

Tomcat 的缺省配置是不能稳定长期运行的，也就是不适合生产环境，它会死机，让你不断重新启动，甚至在午夜时分唤醒你。

Tomcat 的优化不像其它软件那样，简简单单的修改几个参数就可以了，它的优化主要有三方面，分为系统优化，Tomcat 自身容器的优化，Java 虚拟机（JVM）调优。系统优化就不在介绍了，接下来就详细的介绍一下 Tomcat 本身与 JVM 优化，以 Tomcat 8 为例。

## 二、环境

- OS: Cent OS 7
- JDK: 1.8
- Tomcat：apache-tomcat-8.5.8

## 三、Tomcat性能调优

### 1.启动参数优化

创建配置文件

```bash
touch setenv.sh
chmod 755 bin/setenv.sh
```

bin目录下新建的可执行文件setenv.sh会由tomcat自动调用，或添加到startup.sh中也可以。

```bash

JAVA_OPTS="
-server -XX:PermSize=256M -XX:MaxPermSize=512M
-Xms2048M -Xmx2048M -Xmn768m -Xss512k -verbose:gc
-XX:+AggressiveOpts -XX:+UseBiasedLocking
-XX:+DisableExplicitGC -XX:MaxTenuringThreshold=31
-XX:+UseConcMarkSweepGC -XX:+UseParNewGC  
-XX:+CMSParallelRemarkEnabled -XX:+UseCMSCompactAtFullCollection
-XX:LargePageSizeInBytes=128m -XX:+UseFastAccessorMethods
-XX:+UseCMSInitiatingOccupancyOnly
-Djava.awt.headless=true
-Dfile.encoding=UTF-8"

```


#### 参数详解

`-server`

我不管你什么理由，只要你的tomcat是运行在生产环境中的，这个参数必须给我加上
<br/>因为tomcat默认是以一种叫`java –client`的模式来运行的，server即意味着你的tomcat是以真实的production的模式在运行的，这也就意味着你的tomcat以server模式运行时将拥有：更大、更高的并发处理能力，更快更强捷的JVM垃圾回收机制，可以获得更多的负载与吞吐量。

**注：**`-server`一定要加。

--------------------------------

`-verbose:gc`

表示输出虚拟机中GC的详细情况.

使用后输出如下:

`[Full GC 168K->97K(1984K)， 0.0253873 secs]`

解读如下:箭头前后的数据168K和97K分别表示垃圾收集GC前后所有存活对象使用的内存容量，说明有168K-97K=71K的对象容量被回收，括号内的数据1984K为堆内存的总容量，收集所需要的时间是0.0253873秒（这个时间在每次执行的时候会有所不同）

--------------------------------

`-Xms –Xmx`

即JVM内存设置了，把Xms与Xmx两个值设成一样是最优的做法。

`-Xms`为初始堆大小,`-Xmx`	为最大堆大小

大家想一下这样的场景：

一个系统随着并发数越来越高，它的内存使用情况逐步上升，上升到最高点不能上升了，开始回落，你们不要认为这个回落就是好事情，由其是大起大落，在内存回落时它付出的代价是CPU高速开始运转进行垃圾回收，此时严重的甚至会造成你的系统出现“卡壳”就是你在好好的操作，突然网页像死在那边一样几秒甚至十几秒时间，因为JVM正在进行垃圾回收。

因此一开始我们就把这两个设成一样，使得Tomcat在启动时就为最大化参数充分利用系统的效率，这个道理和jdbcconnection pool里的minpool size与maxpool size的需要设成一个数量是一样的原理。

如何知道我的JVM能够使用最大值啊？拍脑袋？不行！
在设这个最大内存即Xmx值时请先打开一个命令行，键入如下的命令：
如果能正常输出版本信息，则表示JVM能使用的最大值，如果报错则表示不能使用

```bash
java -Xmx2048m -version
```

因此在设这个-Xms与-Xmx值时一定一定记得先这样测试一下，要不然直接加在tomcat启动命令行中你的tomcat就再也起不来了

--------------------------------

`–Xmn`

设置年轻代大小为512m。整个堆大小=年轻代大小 + 年老代大小 + 持久代大小。持久代一般固定大小为64m，所以增大年轻代后，将会减小年老代大小。此值对系统性能影响较大，Sun官方推荐配置为整个堆的3/8。

--------------------------------

`-Xss`

是指设定每个线程的堆栈大小。这个就要依据你的程序，看一个线程 大约需要占用多少内存，可能会有多少线程同时运行等。一般设置成512k~1M就可以，最大不宜超过1M，要不然容易出现out ofmemory。

--------------------------------

`-XX:+AggressiveOpts`

作用如其名（aggressive），启用这个参数，则每当JDK版本升级时，你的JVM都会使用最新加入的优化技术（如果有的话）

--------------------------------

`-XX:+UseBiasedLocking`

启用一个优化了的线程锁，我们知道在我们的appserver，每个http请求就是一个线程，有的请求短有的请求长，就会有请求排队的现象，甚至还会出现线程阻塞，这个优化了的线程锁使得你的appserver内对线程处理自动进行最优调配。

--------------------------------

`-XX:PermSize=128M -XX:MaxPermSize=256M`

JVM使用`-XX:PermSize`设置非堆内存初始值，默认是物理内存的1/64；
在数据量的很大的文件导出时，一定要把这两个值设置上，否则会出现内存溢出的错误。由`XX:MaxPermSize`设置最大非堆内存的大小，默认是物理内存的1/4。那么，如果是物理内存4GB，那么64分之一就是64MB，这就是PermSize默认值，也就是永生代内存初始大小；四分之一是1024MB，这就是`MaxPermSize`默认大小。

--------------------------------

`-XX:+DisableExplicitGC`

在程序代码中不允许有显示的调用`System.gc()`。

--------------------------------

`-XX:+UseParNewGC`

对年轻代采用多线程并行回收，这样收得快。

--------------------------------

`-XX:+UseConcMarkSweepGC`

即CMS gc，这一特性只有jdk1.5即后续版本才具有的功能，它使用的是gc估算触发和`heap`占用触发。
我们知道频频繁的GC会造面JVM的大起大落从而影响到系统的效率，因此使用了CMS GC后可以在GC次数增多的情况下，每次GC的响应时间却很短，比如说使用了CMS GC后经过jprofiler的观察，GC被触发次数非常多，而每次GC耗时仅为几毫秒。

--------------------------------

`-XX:MaxTenuringThreshold=31`

设置垃圾最大年龄。如果设置为0的话，则年轻代对象不经过Survivor区，直接进入年老代。对于年老代比较多的应用，可以提高效率。如果将此值设置为一个较大值，则年轻代对象会在Survivor区进行多次复制，这样可以增加对象再年轻代的存活时间，增加在年轻代即被回收的概率。
这个值的设置是根据本地的jprofiler监控后得到的一个理想的值，不能一概而论原搬照抄。

--------------------------------

`-XX:+CMSParallelRemarkEnabled`

在使用UseParNewGC 的情况下, 尽量减少 mark 的时间

--------------------------------

`-XX:+UseCMSCompactAtFullCollection`

在使用concurrent gc 的情况下, 防止 memoryfragmention, 对live object 进行整理, 使 memory 碎片减少。

--------------------------------

`-XX:LargePageSizeInBytes`

指定 Java heap的分页页面大小

--------------------------------

`-XX:+UseFastAccessorMethods`

get,set 方法转成本地代码

--------------------------------

`-XX:+UseCMSInitiatingOccupancyOnly`

指示只有在 oldgeneration 在使用了初始化的比例后concurrent collector 启动收集

--------------------------------

`-XX:CMSInitiatingOccupancyFraction=70`

CMSInitiatingOccupancyFraction，这个参数设置有很大技巧，基本上满足`(Xmx-Xmn)*(100- CMSInitiatingOccupancyFraction)/100>=Xmn`就不会出现promotion failed。在我的应用中`Xmx`是6000，`Xmn`是512，那么`Xmx-Xmn`是5488M，也就是年老代有5488M，`CMSInitiatingOccupancyFraction=90`说明年老代到90%满的时候开始执行对年老代的并发垃圾回收（CMS），这时还 剩10%的空间是5488*10%=548M，所以即使`Xmn`（也就是年轻代共512M）里所有对象都搬到年老代里，548M的空间也足够了，所以只要满足上面的公式，就不会出现垃圾回收时的promotion failed；因此这个参数的设置必须与`Xmn`关联在一起。

--------------------------------

`-Djava.awt.headless=true`

这个参数一般我们都是放在最后使用的，这全参数的作用是这样的，有时我们会在我们的J2EE工程中使用一些图表工具如：jfreechart，用于在web网页输出GIF/JPG等流，在winodws环境下，一般我们的app server在输出图形时不会碰到什么问题，但是在linux/unix环境下经常会碰到一个exception导致你在winodws开发环境下图片显示的好好可是在linux/unix下却显示不出来，因此加上这个参数以免避这样的情况出现。
上述这样的配置，基本上可以达到：

- 系统响应时间增快
- JVM回收速度增快同时又不影响系统的响应率
- JVM内存最大化利用
- 线程阻塞情况最小化


### 2.容器内的优化

前面主要对JVM的启动参数进行优化，接下来我们主要对Tomcat的容器进行优化，Tomcat容器的优化主要针对`<Connector>`进行优化，包括`<Connector port="8080" protocol="HTTP/1.1"`(HTTP请求)和`<Connector port="8009" protocol="AJP/1.3"`


`server.xml` 配置说明

```xml
<?xml version='1.0' encoding='utf-8'?>
<!-- Note:  A "Server" is not itself a "Container", so you may not
     define subcomponents such as "Valves" at this level.
     Documentation at /docs/config/server.html
 -->
<!--
 <Server>元素：是整个配置文件的根元素。表示整个Catalina容器。

 属性：
  className：实现了org.apache.catalina.Server接口的类名，标准实现类是org.apache.catalina.core.StandardServer类。
  Port：Tomcat服务器监听用于关闭Tomcat服务器的命令（必须）
  Shutdown：发送到端口上用于关闭Tomcat服务器的命令。
-->
<Server port="8005" shutdown="SHUTDOWN">

  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <!-- Security listener. Documentation at /docs/config/listeners.html
  <Listener className="org.apache.catalina.security.SecurityListener" />
  -->
  <!--APR library loader. Documentation at /docs/apr.html -->
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <!--Initialize Jasper prior to webapps are loaded. Documentation at /docs/jasper-howto.html -->
  <Listener className="org.apache.catalina.core.JasperListener" />
  <!-- Prevent memory leaks due to use of particular java/javax APIs-->
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <!--
  Global JNDI resources Documentation at /docs/jndi-resources-howto.html
  -->
  <GlobalNamingResources>
    <!-- Editable user database that can also be used by
         UserDatabaseRealm to authenticate users
    -->
    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <!-- A "Service" is a collection of one or more "Connectors" that share
       a single "Container" Note:  A "Service" is not itself a "Container",
       so you may not define subcomponents such as "Valves" at this level.
       Documentation at /docs/config/service.html
   -->
  <Service name="Catalina">

    <!--The connectors can use a shared executor, you can define one or more named thread pools-->
    <!--
    <Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="150" minSpareThreads="4"/>
    -->


    <!-- A "Connector" represents an endpoint by which requests are received
         and responses are returned. Documentation at :
         Java HTTP Connector: /docs/config/http.html (blocking & non-blocking)
         Java AJP  Connector: /docs/config/ajp.html
         APR (HTTP/AJP) Connector: /docs/apr.html
         Define a non-SSL HTTP/1.1 Connector on port 8080
    -->
    <!--
        <Connector>元素：连接器，负责接收客户的请求，以及向客户端回送响应的消息。

        HTTP连接器：
        属性：
          allowTrace：是否允许HTTP的TRACE方法，默认为false
          emptySessionPath：如果设置为true，用户的所有路径都将设置为/，默认为false。
          enableLookups：调用request、getRemoteHost()执行DNS查询，以返回远程主机的主机名，如果设置为false，则直接返回IP地址。
          maxPostSize：指定POST方式请求的最大量，没有指定默认为2097152。
          protocol：值为HTTP1.1，或使用org.apache.coyote.http11.Http11NioProtocol效率更高。如果使用AJP处理器，该值必须为AJP/1.3
          proxyName：如这个连接器正在一个代理配置中被使用，指定这个属性，在request.getServerName()时返回
          redirectPort：如连接器不支持SSL请求，如收到SSL请求，Catalina容器将会自动重定向指定的端口号，让其进行处理。
          scheme：设置协议的名字，在request.getScheme()时返回，SSL连接器设为”https”，默认为”http”
          secure：在SSL连接器可将其设置为true，默认为false
          URIEncoding：用于解码URL的字符编码，没有指定默认值为ISO-8859-1
          useBodyEncodingForURI：主要用于Tomcat4.1.x中，指示是否使用在contentType中指定的编码来取代URIEncoding，用于解码URI查询参数，默认为false
          xpoweredBy：为true时，Tomcat使用规范建议的报头表明支持Servlet的规范版本，默认为false
          acceptCount：当所有的可能处理的线程都正在使用时，在队列中排队请求的最大数目。当队列已满，任何接收到的请求都会被拒绝，默认值为10
          bufferSize：设由连接器创建输入流缓冲区的大小，以字节为单位。默认情况下，缓存区大的大小为2048字节
          compressableMimeType：MIME的列表，默认以逗号分隔。默认值是text/html，text/xml，text/plain
          compression：指定是否对响应的数据进行压缩。off：表示禁止压缩、on：表示允许压缩（文本将被压缩）、force：表示所有情况下都进行压缩，默认值为off
          connectionTimeout：设置连接的超时值，以毫秒为单位。默认值为60000=60秒
          disableUploadTimeOut：允许Servlet容器，正在执行使用一个较长的连接超时值，以使Servlet有较长的时间来完成它的执行，默认值为false
          maxHttpHeaderSize：HTTP请求和响应头的最大量，以字节为单位，默认值为4096字节
          maxKeepAliveRequest：服务器关闭之前，客户端发送的流水线最大数目。默认值为100
          maxSpareThreads：允许存在空闲线程的最大数目，默认值为50
          minSpareThreads：设当连接器第一次启协创建线程的数目，确保至少有这么多的空闲线程可用。默认值为4
          port：服务端套接字监听的TCP端口号，默认值为8080（必须）
          socketBuffer：设Socket输出缓冲区的大小（以字节为单位），-1表示禁止缓冲，默认值为9000字节
          toNoDelay：为true时，可以提高性能。默认值为true
          threadPriority：设JVM中请求处理线程优先级。默认值为NORMAL-PRIORITY
          maxThreads: Tomcat使用线程来处理接收的每个请求。这个值表示Tomcat可创建的最大的线程数，即最大并发数。
          maxProcessors="2000" minProcessors="5": 在 Java中线程是程序运行时的路径，是在一个程序中与其它控制线程无关的、能够独立运行的代码段。它们共享相同的地址空间。多线程帮助程序员写出CPU最 大利用率的高效程序，使空闲时间保持最低，从而接受更多的请求。通常Windows是1000个左右，Linux是2000个左右。
          useURIValidationHack: 对一些url检查。一般设为false，可以减少它对一些url的不必要的检查从而减省开销。

          给Tomcat配置gzip压缩(HTTP压缩)功能:
          compression="on"
          compressionMinSize="2048"             
          compressableMimeType="text/html,text/xml,text/javascript,text/css,text/plain"

          HTTP 压缩可以大大提高浏览网站的速度，它的原理是，在客户端请求网页后，从服务器端将网页文件压缩，再下载到客户端，由客户端的浏览器负责解压缩并浏览。相对于普通的浏览过程HTML,CSS,Javascript , Text ，它可以节省40%左右的流量。更为重要的是，它可以对动态生成的，包括CGI、PHP , JSP , ASP , Servlet,SHTML等输出的网页也能进行压缩，压缩效率惊人。
            1)compression="on" 打开压缩功能
            2)compressionMinSize="2048" 启用压缩的输出内容大小，这里面默认为2KB
            3)noCompressionUserAgents="gozilla, traviata" 对于以下的浏览器，不启用压缩
            4)compressableMimeType="text/html,text/xml"　压缩类型
    -->
    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
    <!-- A "Connector" using the shared thread pool-->
    <!--
    <Connector executor="tomcatThreadPool"
               port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
    -->
    <!-- Define a SSL HTTP/1.1 Connector on port 8443
         This connector uses the BIO implementation that requires the JSSE
         style configuration. When using the APR/native implementation, the
         OpenSSL style configuration is required as described in the APR/native
         documentation -->
    <!--
    <Connector port="8443" protocol="org.apache.coyote.http11.Http11Protocol"
               maxThreads="150" SSLEnabled="true" scheme="https" secure="true"
               clientAuth="false" sslProtocol="TLS" />
    -->

    <!--
    AJP连接器：用于将Apache与Tomcat集成在一起，当Apache接收到动态内容请求时，通过在配置中指定的端口号将请求发送给在此端口号上监听的AJP连接器组件。

    属性：
      backlog：当所有可能的请求处理线程都在使用时，队列中排队的请求最大数目。默认为10，当队列已满，任何请求都将被拒绝
      maxSpareThread：允许存在空闲线程的最大数目，默认值为50
      maxThread：最大线程数，默认值为200
      minSpareThreads：设当连接器第一次启动时创建线程的数目，确保至少有这么多的空闲线程可用，默认值为4
      port：服务端套接字的TCP端口号，默认值为8089（必须）
      topNoDelay：为true时，可以提高性能，默认值为true
      soTimeout：超时值
    -->
    <!-- Define an AJP 1.3 Connector on port 8009 -->
    <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />


    <!-- An Engine represents the entry point (within Catalina) that processes
         every request.  The Engine implementation for Tomcat stand alone
         analyzes the HTTP headers included with the request, and passes them
         on to the appropriate Host (virtual host).
         Documentation at /docs/config/engine.html -->

    <!-- You should set jvmRoute to support load-balancing via AJP ie :
    <Engine name="Catalina" defaultHost="localhost" jvmRoute="jvm1">
    -->
    <!--
    <Engine>元素：
      为特定的Service处理所有的请示。每个Service只能包含一个Engine元素，它负责接收和处理此Service所有的连接器收到的请求，向连接发回响应，并最终显示在客户端。<Engine>至少有一个<Host>元素，必须至少有一个<Host>属性的名字与defaultHost指定的名字相匹配。

      属性：
        className：实现org.apache.catalina.Engine接口，默认实现类为org.apache.catalina.core.StandardEngine类
        defaultHost：默认主机名，值必须与<Service>的name值相匹配
        name：指定Engine的逻辑名字（必须）
        jvmRoute：在负载匀衡中使用的标识符，必须唯一

    -->
    <Engine name="Catalina" defaultHost="localhost">

      <!--For clustering, please take a look at documentation at:
          /docs/cluster-howto.html  (simple how to)
          /docs/config/cluster.html (reference documentation) -->
      <!--
      <Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster"/>
      -->

      <!-- Use the LockOutRealm to prevent attempts to guess user passwords
           via a brute-force attack -->
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <!-- This Realm uses the UserDatabase configured in the global JNDI
             resources under the key "UserDatabase".  Any edits
             that are performed against this UserDatabase are immediately
             available for use by the Realm.  -->
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <!--
      <Host>元素：
        表示一个虚拟主机，为特定的虚拟主机处理所有请求

      属性：
        appBase：设定应用程序的基目录，绝对路径或相对于%CATALINA_HOME%的路径名
        autoDeploy：指示Tomcat运行时，如有新的WEB程序加开appBase指定的目录下，是否为自动布署，默认值为true
        className：实现了org.apache.catalina.Host接口的类，标准实现类为org.apache.catalina.core.StandardHost类
        deployOnStartup：Tomcat启动时，是否自动部署appBase属性指定目录下所有的WEB应用程序，默认值为true
        name：虚拟主机的网络名（必须）

        标准Host实现类org.apahce.catalina.core.StandardHost支持的附加属性：
        deployXML：为false将不会解析WEB应用程序内部的context.xml，默认值为true
        unPackWARs：虚拟主机指定临时读写使用的目录的路径名，不设，Tomcat会在%CATALINA_HOME%/work目录下提供一个合适的目录。
      -->
      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">

        <!-- SingleSignOn valve, share authentication between web applications
             Documentation at: /docs/config/valve.html -->
        <!--
        <Valve className="org.apache.catalina.authenticator.SingleSignOn" />
        -->

        <!-- Access log processes all example.
             Documentation at: /docs/config/valve.html
             Note: The pattern used is equivalent to using pattern="common" -->
        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log." suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />

      </Host>

      <!--
      <context>元素：
        一个WEB应用程序，处理当前WEB应用程序的所有请求，每一个<Context>必须使用唯一的上下文路径。

      属性：
        className：实现了org.apache.catalina.Context接口的类，标准实现类org.apache.catalina.core.StandardContext类
        cookies：是否将Cookie应用于Session，默认值为true
        crossContext：是否允许跨域访问，为true时，在程序内调用ServletContext.getContext()方法将返回一个虚拟主机上其它web程序的请求调度器。默认值为false，调 径用getContext()返回为null
        docBase：绝对路径或相对于Host的appBase 属性的相对路径
        privileged：为true，允许Web应用程序使用容器的Servlet
        path：指定上下文路径。一个虚拟主机中，上下文路径必须唯一
        reloadable：为true，Tomcat运行时，如果WEB-INF/classes和WEB-INF/lib目录中有改变，Tomcat会自动重新加载该WEB应用程序。虽方便，但开销也大，默认值为false，我们在调用可以打开，发布后再关闭。
        cacheMaxSize：静态资源缓存最大值，以KB为单位，默认值为10240KB
        cachingAllowed：是否允许静态资源缓存，默认为true
        caseSensitive：默认为true,资源文件名大小写敏感，如果为false大小写不敏感
        unpackWAR：默认为true
        workDir：为WEB应用程序内部的Servlet指定临时读写的目录路径名。如没有设置，则Tomcat会在%CATALINA_HOME%/work目录下提供一个合适的目录

      例：
        <Content path=”/abc” docBase=”d:/xyz” reloadable=”true” />
    -->
    </Engine>
  </Service>
</Server>
```




## 四、添加JMX监控

在setenv.sh中添加如下代码：

```bash
# 添加JMX监控
CATALINA_OPTS="
-Dcom.sun.management.jmxremote.port=7091
-Dcom.sun.management.jmxremote.ssl=false
-Dcom.sun.management.jmxremote.authenticate=false
-Djava.rmi.server.hostname=192.168.10.100"
```

添加JMX监控之后使用`$JAVA_HOME/bin`下的`jconsole.exe`或`jvisualvm.exe`查看。

**jconsole使用方法：**

jconsole输入如下地址：`service:jmx:rmi:///jndi/rmi://172.16.100.114:8060/jmxrmi`


**jvisualvm使用方法：**

jvisualvm操作步骤：文件->添加远程主机->输入主机名(IP)->确定->鼠标右键主机名->添加JMX连接->输入`IP:PORT`和安全凭证->确定

上面的`jmxremote.authenticate`在正式环境中请务必设为true并设置用户名/密码，减少安全隐患，或者注释掉`CATALINA_OPTS`(有时候出于性能调优的目的，才需要设置JMX)。

**添加用户名/密码方法：**

1. 将`$JAVA_HOME/jre/lib/management`下的`jmxremote.access`和`jmxremote.password.template`复制到tomcat/conf中
2. 将`jmxremote.password.template`重命名为`jmxremote.password`
3. 修改`jmxremote.password`的权限`chmod +w jmxremote.password`
4. 放开角色信息那俩行的注释(monitorRole QED,controlRole R&D),保存
5. 再次修改`jmxremote.password`的权限`chmod 0400 jmxremote.password`
6. 修改`CATALINA_OPTS`如下

```bash
Dcom.sun.management.jmxremote.authenticate=true   
Dcom.sun.management.jmxremote.password.file=../conf/jmxremote.password
Dcom.sun.management.jmxremote.access.file=../conf/jmxremote.access
```



<div class="elementHide">
http://ajita.iteye.com/blog/1994974


JAVA_OPTS=%JAVA_OPTS%  
-server –Xms8192m –Xmx8192m–Xmn1890m -verbose:gc

-XX:+UseConcMarkSweepGC  -XX:MaxTenuringThreshold=5
-XX:+ExplicitGCInvokesConcurrent -XX:GCTimeRatio=19
-XX:CMSInitiatingOccupancyFraction=70-XX:CMSFullGCsBeforeCompaction=0
–Xnoclassgc -XX:SoftRefLRUPolicyMSPerMB=0



```shell
JAVA_HOME="/snow/jdk1.7.0_79"
CATALINA_OPTS="$CATALINA_OPTS -Djava.library.path=/snwo/apr/lib"
```

**参考资料：**
http://blog.csdn.net/lifetragedy/article/details/7708724
</div>
