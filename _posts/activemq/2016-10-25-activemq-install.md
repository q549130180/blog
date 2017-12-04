---
layout: post
title:  ActiveMQ 高可用集群安装、配置
description: "ActiveMQ 是Apache出品，最流行的，能力强劲的开源消息总线。ActiveMQ 是一个完全支持JMS1.1和J2EE 1.4规范的 JMS Provider实现，尽管JMS规范出台已经是很久的事情了，但是JMS在当今的J2EE应用中间仍然扮演着特殊的地位。"
modified: 2016-10-25 15:20:20
tags: [ActiveMQ,JMS,Java]
post_type: developer
series: ActiveMQ系列文章
categories: [ActiveMQ]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---


## 一、ActiveMQ简介

ActiveMQ 是Apache出品，最流行的，能力强劲的开源消息总线。ActiveMQ 是一个完全支持JMS1.1和J2EE 1.4规范的 JMS Provider实现，尽管JMS规范出台已经是很久的事情了，但是JMS在当今的J2EE应用中间仍然扮演着特殊的地位。

ActiveMQ的设计目标是提供标准的，面向消息的，能够跨越多语言和多系统的应用集成消息通信中间件。ActiveMQ实现了JMS标准并提供了很多附加的特性。这些附加的特性包括，JMX管理（Java Management Extensions，即Java管理扩展），主从管理（master/salve，这是集群模式的一种，主要体现在可靠性方面，当主中介（代理）出现故障，那么从代理会替代主代理的位置，不至于使消息系统瘫痪）、消息组通信（同一组的消息，仅会提交给一个客户进行处理）、有序消息管理（确保消息能够按照发送的次序被接受者接收）。

### 1、特性列表

1. 多种语言和协议编写客户端。语言: Java,C,C++,C#,Ruby,Perl,Python,PHP。应用协议： OpenWire,Stomp REST,WS Notification,XMPP,AMQP
2. 完全支持JMS1.1和J2EE 1.4规范 （持久化，XA消息，事务)
3. 对Spring的支持，ActiveMQ可以很容易内嵌到使用Spring的系统里面去，而且也支持Spring2.0的特性
4. 通过了常见J2EE服务器（如 Geronimo,JBoss 4,GlassFish,WebLogic)的测试，其中通过JCA 1.5 resource adaptors的配置，可以让ActiveMQ可以自动的部署到任何兼容J2EE 1.4 商业服务器上
5. 支持多种传送协议：in-VM,TCP,SSL,NIO,UDP,JGroups,JXTA
6. 支持通过JDBC和journal提供高速的消息持久化
7. 从设计上保证了高性能的集群，客户端-服务器，点对点
8.  支持Ajax
9. 支持与Axis的整合
10. 可以很容易的调用内嵌JMS provider，进行测试

### 2、ActiveMQ整体架构

ActiveMQ主要涉及到5个方面：


**1.传输协议**

消息之间的传递，无疑需要协议进行沟通，启动一个ActiveMQ打开了一个监听端口， 	ActiveMQ提供了广泛的连接模式，其中主要包括SSL、STOMP、XMPP；ActiveMQ默认的使用	的协议是openWire，端口号：61616;

**2.消息域**

ActiveMQ主要包含Point-to-Point (点对点),Publish/Subscribe Model (发布/订阅者)，其中在	Publich/Subscribe 模式下又有Nondurable subscription和durable subscription (持久化订阅)2种消息处理方式

**3.消息存储**

在消息传递过程中，部分重要的消息可能需要存储到数据库或文件系统中，当中介崩溃时，信息不	回丢失

**4.Cluster(集群)**

最常见到 集群方式包括network of brokers和Master Slave；

**5.Monitor (监控)**

ActiveMQ一般由jmx来进行监控；

![Alt text]({{site.url}}/images/posts_image/activemq-activemq-2016-10-26_141310.jpg)

## 二、ActiveMQ 安装与配置

### 1、环境

- OS:Cent OS 7
- Java:JDK 1.7
- Zookeeper:3.3.3
- ActiveMQ:5.14.0

从 ActiveMQ 5.9 开始，ActiveMQ 的集群实现方式取消了传统的 Master-Slave 方式，增加了基于[ZooKeeper][4] + [LevelDB][5] 的 Master-Slave 实现方式，其他两种方式目录共享和数据库共享依然存在。

### 2、集群搭建方式对比

三种集群方式的对比：

**(1) 基于共享文件系统（KahaDB，默认）：**

```xml
<persistenceAdapter>
  <kahaDB directory="${activemq.data}/kahadb"/>
</persistenceAdapter>
```

**(2) 基于 JDBC：**

```xml
<bean id="mysql-ds" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
  <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
  <property name="url" value="jdbc:mysql://localhost:3306/amq?relaxAutoCommit=true"/>
  <property name="username" value="root"/>
  <property name="password" value="root"/>
  <property name="maxActive" value="20"/>
  <property name="poolPreparedStatements" value="true"/>
</bean>
<persistenceAdapter>
  <jdbcPersistenceAdapter dataDirectory="${activemq.data}" dataSource="#mysql-ds" createTablesOnStartup="false"/>
</persistenceAdapter>
```

**(3) 基于可复制的 LevelDB（本教程采用这种集群方式）：**

LevelDB 是 Google 开发的一套用于持久化数据的高性能类库。LevelDB 并不是一种服务,用户需要自行实现 Server。是单进程的服务，能够处理十亿级别规模 Key-Value 型数据，占用内存小。

```xml
<persistenceAdapter>
  <replicatedLevelDB
    directory="${activemq.data}/leveldb"
    replicas="3"
    bind="tcp://0.0.0.0:62621"
    zkAddress="localhost:2181,localhost:2182,localhost:2183"
    hostname="localhost"
    zkPath="/activemq/leveldb-stores"
  />
</persistenceAdapter>
```

### 3、集群原理

集群原理图：

![Alt text]({{site.url}}/images/posts_image/activemq-activemq-2016-090270123456.png)

[ActiveMQ特性][3]([官方文档地址][2])

高可用的原理：使用 ZooKeeper（集群）注册所有的 ActiveMQ Broker。只有其中的一个 Broker 可以提供服务，被视为 Master，其他的 Broker 处于待机状态，被视为 Slave。如果 Master 因故障而不能提供服务，ZooKeeper 会从 Slave 中选举出一个 Broker 充当 Master。

Slave 连接 Master 并同步他们的存储状态，Slave 不接受客户端连接。所有的存储操作都将被复制到连接至 Master 的 Slaves。如果 Master 宕了，得到了最新更新的 Slave 会成为 Master。故障节点在恢复后会重新加入到集群中并连接 Master 进入 Slave 模式。

所有需要同步的 disk 的消息操作都将等待存储状态被复制到其他法定节点的操作完成才能完成。所以，如果你配置了 replicas=3，那么法定大小是(3/2)+1=2。Master 将会存储并更新然后等待 (2-1)=1 个Slave 存储和更新完成，才汇报 success。至于为什么是 2-1，熟悉 Zookeeper 的应该知道，有一个 node 要作为观擦者存在。当一个新的 Master 被选中，你需要至少保障一个法定 node 在线以能够找到拥有最新状态的 node。这个 node 可以成为新的 Master。因此，推荐运行至少 3 个 replica nodes，以防止一个 node 失败了，服务中断。（原理与 ZooKeeper 集群的高可用实现方式类似）

客户应该使用故障转移运输连接到代理节点的集群复制。如使用URL类似如下:

```xml
failover:(tcp://broker1:61616,tcp://broker2:61616,tcp://broker3:61616)
```

### 4、Master/Slave集群搭建-基于ZooKeeper

**1、ActiveMQ 集群部署规划：**

ZooKeeper 集群环境：`192.168.1.100:2181,192.168.1.100:2182,192.168.1.100:2183`

（[ZooKeeper 集群部署请参考《Zookeeper伪分布式集群安装及使用》]({{ site.url }}/zookeeper/zookeeper-cluster/)）

主机 | 集群端口 | 消息端口 | 管控台端口 | 节点安装目录
------------- | ------------- | ------------- | ------------- | -------------
192.168.1.100 | 62621 | 61616 | 8161 | /snow/activemq/group1/node-01
192.168.1.100 | 62622 | 61617 | 8162 | /snow/activemq/group1/node-02
192.168.1.100 | 62623 | 61618 | 8163 | /snow/activemq/group1/node-03
{:.mytablestyle}


**2、防火墙打开对应的端口或关闭防火墙**

Cent OS 7 关闭防火墙命令：

```bash
$ firewall-cmd --state #查看防火墙状态
running

$ systemctl start firewalld.service #启动firewall
$ systemctl stop firewalld.service #停止firewall
$ systemctl disable firewalld.service #禁止firewall开机启动

```

**3、下载安装文件并创建相应文件夹**

在[ActiveMQ官网][1]下载：apache-activemq-5.14.0-bin.tar


创建/home/wusc/activemq 目录

```bash
$ mkdir /snow/activemq
$ mkdir /snow/activemq/group1
$ cd /snow/activemq/group1
$ mkdir node-1 node-2 node-3
$ tar -zxvf apache-activemq-5.14.0-bin.tar
$ cd apache-activemq-5.14.0
$ cp -rf * /snow/activemq/group1/node-1
$ cp -rf * /snow/activemq/group1/node-2
$ cp -rf * /snow/activemq/group1/node-3

```

**4、修改管理控制台端口**

修改`conf/jetty.xml` 中的端口（默认为 `8161`），如下：

Node-01 管控台端口：

```xml
<bean id="jettyPort" class="org.apache.activemq.web.WebConsolePort" init-method="start">
  <!-- the default port number for the web console -->
  <property name="host" value="0.0.0.0"/>
  <property name="port" value="8161"/>
</bean>
```

Node-02 管控台端口：

```xml
<bean id="jettyPort" class="org.apache.activemq.web.WebConsolePort" init-method="start">
  <!-- the default port number for the web console -->
  <property name="host" value="0.0.0.0"/>
  <property name="port" value="8162"/>
</bean>
```

Node-03 管控台端口：

```xml
<bean id="jettyPort" class="org.apache.activemq.web.WebConsolePort" init-method="start">
  <!-- the default port number for the web console -->
  <property name="host" value="0.0.0.0"/>
  <property name="port" value="8163"/>
</bean>
```



**5、集群配置：**

在 3 个 ActiveMQ 节点中配置 `conf/activemq.xml` 中的持久化适配器。修改其中 `bind`、`zkAddress`、`hostname` 和 `zkPath`。注意：每个 ActiveMQ 的 `BrokerName` 必须相同，否则不能加入集群。

Node-01 中的持久化配置:

```xml
<broker xmlns="http://activemq.apache.org/schema/core" brokerName="SnowEdu" dataDirectory="${activemq.data}">
    <persistenceAdapter>
        <!-- kahaDB directory="${activemq.data}/kahadb"/ -->
        <replicatedLevelDB
            directory="${activemq.data}/leveldb"
            replicas="3"
            bind="tcp://0.0.0.0:62621"
            zkAddress="192.168.1.100:2181,192.168.1.100:2182,192.168.1.100:2183"
            hostname="snow"
            zkPath="/activemq/leveldb-stores"
        />
    </persistenceAdapter>
</broker>
```

Node-02 中的持久化配置:

```xml
<broker xmlns="http://activemq.apache.org/schema/core" brokerName="SnowEdu" dataDirectory="${activemq.data}">
    <persistenceAdapter>
        <!-- kahaDB directory="${activemq.data}/kahadb"/ -->
        <replicatedLevelDB
            directory="${activemq.data}/leveldb"
            replicas="3"
            bind="tcp://0.0.0.0:62622"
            zkAddress="192.168.1.100:2181,192.168.1.100:2182,192.168.1.100:2183"
            hostname="snow"
            zkPath="/activemq/leveldb-stores"
         />
    </persistenceAdapter>
</broker>
```

Node-03 中的持久化配置:

```xml
<broker xmlns="http://activemq.apache.org/schema/core" brokerName="SnowEdu" dataDirectory="${activemq.data}">
    <persistenceAdapter>
        <!-- kahaDB directory="${activemq.data}/kahadb"/ -->
        <replicatedLevelDB
            directory="${activemq.data}/leveldb"
            replicas="3"
            bind="tcp://0.0.0.0:62623"
            zkAddress="192.168.1.100:2181,192.168.1.100:2182,192.168.1.100:2183"
            hostname="snow"
            zkPath="/activemq/leveldb-stores"
         />
    </persistenceAdapter>
</broker>
```

修改各节点的消息端口（注意，避免端口冲突）：

Node-01 中的消息端口配置:

```xml
<transportConnectors>
  <!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB -->
  <transportConnector name="openwire" uri="tcp://0.0.0.0:51511?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="amqp" uri="amqp://0.0.0.0:5672?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="stomp" uri="stomp://0.0.0.0:61613?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="mqtt" uri="mqtt://0.0.0.0:1883?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="ws" uri="ws://0.0.0.0:61614?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
</transportConnectors>
```

Node-02 中的消息端口配置:

```xml
<transportConnectors>
  <!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB -->
  <transportConnector name="openwire" uri="tcp://0.0.0.0:51512?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="amqp" uri="amqp://0.0.0.0:5672?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="stomp" uri="stomp://0.0.0.0:61613?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="mqtt" uri="mqtt://0.0.0.0:1883?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="ws" uri="ws://0.0.0.0:61614?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
</transportConnectors>
```
Node-03 中的消息端口配置:

```xml
<transportConnectors>
  <!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB -->
  <transportConnector name="openwire" uri="tcp://0.0.0.0:51513?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="amqp" uri="amqp://0.0.0.0:5672?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="stomp" uri="stomp://0.0.0.0:61613?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="mqtt" uri="mqtt://0.0.0.0:1883?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
  <transportConnector name="ws" uri="ws://0.0.0.0:61614?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
</transportConnectors>
```



**6、按顺序启动 3 个 ActiveMQ 节点：**

```bash
$ /snow/activemq/group1/node-01/bin/activemq start
$ /snow/activemq/group1/node-02/bin/activemq start
$ /snow/activemq/group1/node-03/bin/activemq start
```

监听日志：

```bash
$ tail -f /snow/activemq/group1/node-01/data/activemq.log
$ tail -f /snow/activemq/group1/node-02/data/activemq.log
$ tail -f /snow/activemq/group1/node-03/data/activemq.log
```

**7、设置开机启动：**

```bash
$ vi /etc/rc.local
su - wusc -c '/snow/activemq/group1/node-01/bin/activemq start'
su - wusc -c '/snow/activemq/group1/node-02/bin/activemq start'
su - wusc -c '/snow/activemq/group1/node-03/bin/activemq start'
```

**8、通过监控查看消息堆栈的记录：**

登陆http://localhost:8161/admin/index.jsp，默认的用户名和密码：admin/admin
![Alt text]({{site.url}}/images/posts_image/activemq_activemq_2016-10-20_134617.jpg)

### 5、Master Slave + Broker Cluster 模式搭建负载均衡

**(1) Master Slave + Broker Cluster 模式结构图**

![Alt text]({{site.url}}/images/posts_image/activemq-activemq-2016-10-25_170132.jpg)

**(2) 复制group1文件夹中的节点到group2文件夹中**

```bash
$ cp -rf * ../group2/
$ mv node-1/ node-4/
$ mv node-2/ node-5/
$ mv node-3/ node-6/
```

文件目录结构：

```
activemq
├── apache-activemq-5.14.0-bin.tar.gz
├── group1
│   ├── node-1
│   ├── node-2
│   └── node-3
└── group2
    ├── node-4
    ├── node-5
    └── node-6
```

**(3) 集群的端口规划**

如果是在同一台机器上搭建集群环境，最好先将端口进行规划，以免会出现问题。

MQ | admin | openwire | amqp | stomp | mqtt | ws | zk | group
------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | -------------
mq1 | 8161 | 61616 | 5672 | 61613 | 1883 | 61614 | 2181,2182,2183 | group1
mq2 | 8162 | 61617 | 5673 | 62613 | 1884 | 61624 | 2181,2182,2183 | group1
mq3 | 8163 | 61618 | 5674 | 63613 | 1885 | 61634 | 2181,2182,2183 | group1
mq4 | 8164 | 61619 | 5675 | 64613 | 1886 | 61644 | 2181,2182,2183 | group2
mq5 | 8165 | 61620 | 5676 | 65613 | 1887 | 61654 | 2181,2182,2183 | group2
mq6 | 8166 | 61621 | 5677 | 66613 | 1888 | 61664 | 2181,2182,2183 | group2
{:.mytablestyle}



**(4) 修改配置文件**

**group1的配置**

修改node-1、node-2、node-3的配置文件，注意修改端口号避免端口冲突;group1中的`networkConnector`设置成group2中的三个节点的IP和端口;`duplex=true` 设置开启MQ节点间双向传输功能



```xml

<networkConnectors>   
     <networkConnector uri="static:(tcp://192.168.1.100:61619,tcp://192.168.1.100:61620,tcp://192.168.1.100:61621)" duplex="true"/>    
</networkConnectors>
```

ZooKeeper是搭建的集群

```xml
<persistenceAdapter>    
    <replicatedLevelDB     
          directory="${activemq.data}/leveldb"    
          replicas="3"    
          bind="tcp://0.0.0.0:0"    
          zkAddress="192.168.1.100:2181,192.168.1.100:2182,192.168.1.100:2183"    
          zkPassword=""    
          hostname="snow"  
          sync="local_disk"  
          zkPath="/activemq/group1/leveldb-stores"   
      />    
</persistenceAdapter>  
```


**group2配置**

修改node-4、node-5、node-6的配置文件，注意修改端口号避免端口冲突;group2中的`networkConnector`设置成group1中的三个节点的IP和端口

```xml

<networkConnectors>   
     <networkConnector uri="static:(tcp://192.168.1.100:61616,tcp://192.168.1.100:61617,tcp://192.168.1.100:61618)" duplex="true"/>    
</networkConnectors>

```

```xml
<persistenceAdapter>    
    <replicatedLevelDB     
          directory="${activemq.data}/leveldb"    
          replicas="3"    
          bind="tcp://0.0.0.0:0"    
          zkAddress="192.168.1.100:2181,192.168.1.100:2182,192.168.1.100:2183"    
          zkPassword=""    
          hostname="snow"  
          sync="local_disk"  
          zkPath="/activemq/group2/leveldb-stores"   
      />    
</persistenceAdapter>  
```





**参考资料：**
<a href="http://blog.csdn.net/lifetragedy/article/details/51869032#t7" target="_blank" >http://blog.csdn.net/lifetragedy/article/details/51869032#t7</a>


[1]:http://activemq.apache.org/
[2]:http://activemq.apache.org/replicated-leveldb-store.html
[3]:http://activemq.apache.org/features.html
[4]:https://zh.wikipedia.org/wiki/Apache_ZooKeeper
[5]:https://zh.wikipedia.org/wiki/LevelDB
