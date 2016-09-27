ActiveMQ 高可用集群安装、配置、高可用测试



## 一、环境

- OS:Cent OS 7
- Java:JDK 1.7
- Zookeeper:3.3.3
- ActiveMQ:5.14.0

从 ActiveMQ 5.9 开始，ActiveMQ 的集群实现方式取消了传统的 Master-Slave 方式，增加了基于ZooKeeper + LevelDB 的 Master-Slave 实现方式，其他两种方式目录共享和数据库共享依然存在。


三种集群方式的对比：
(1)基于共享文件系统（KahaDB，默认）：

```xml
<persistenceAdapter>
  <kahaDB directory="${activemq.data}/kahadb"/>
</persistenceAdapter>
```

(2)基于 JDBC：

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

(3)基于可复制的 LevelDB（本教程采用这种集群方式）：
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

集群原理图：

![Alt text]({{site.url}}/images/posts_image/activemq-activemq-2016-090270123456.png)

[官方文档地址][2]


高可用的原理：使用 ZooKeeper（集群）注册所有的 ActiveMQ Broker。只有其中的一个 Broker 可以提供服务，被视为 Master，其他的 Broker 处于待机状态，被视为 Slave。如果 Master 因故障而不能提供服务，ZooKeeper 会从 Slave 中选举出一个 Broker 充当 Master。

Slave 连接 Master 并同步他们的存储状态，Slave 不接受客户端连接。所有的存储操作都将被复制到连接至 Master 的 Slaves。如果 Master 宕了，得到了最新更新的 Slave 会成为 Master。故障节点在恢复后会重新加入到集群中并连接 Master 进入 Slave 模式。

所有需要同步的 disk 的消息操作都将等待存储状态被复制到其他法定节点的操作完成才能完成。所以，如果你配置了 replicas=3，那么法定大小是(3/2)+1=2。Master 将会存储并更新然后等待 (2-1)=1 个Slave 存储和更新完成，才汇报 success。至于为什么是 2-1，熟悉 Zookeeper 的应该知道，有一个 node 要作为观擦者存在。当一个新的 Master 被选中，你需要至少保障一个法定 node 在线以能够找到拥有最新状态的 node。这个 node 可以成为新的 Master。因此，推荐运行至少 3 个 replica nodes，以防止一个 node 失败了，服务中断。（原理与 ZooKeeper 集群的高可用实现方式类似）


1、ActiveMQ 集群部署规划：

ZooKeeper 集群环境：192.168.1.81:2181,192.168.1.82:2182,192.168.1.83:2183

（ZooKeeper 集群部署请参考《Zookeeper伪分布式集群安装及使用》）

主机 | 集群端口 | 消息端口 | 管控台端口 | 节点安装目录
------------- | ------------- | ------------- | ------------- | -------------
192.168.1.81 | 62621 | 51511 | 8161 | /snow/activemq/node-01
192.168.1.82 | 62622 | 51512 | 8162 | /snow/activemq/node-02
192.168.1.83 | 62623 | 51513 | 8163 | /snow/activemq/node-03
{:.mytablestyle}


2、防火墙打开对应的端口或关闭防火墙

在[ActiveMQ官网][1]下载：apache-activemq-5.14.0-bin.tar


创建/home/wusc/activemq 目录

```bash
$ mkdir /snow/activemq
$ cd /snow/activemq
$ mkdir node-1 node-2 node-3
$ tar -zxvf apache-activemq-5.14.0-bin.tar
$ cd apache-activemq-5.14.0
$ cp -rf * /snow/activemq/node-1
$ cp -rf * /snow/activemq/node-2
$ cp -rf * /snow/activemq/node-3

```

5、修改管理控制台端口（默认为 `8161`）可在 `conf/jetty.xml` 中修改，如下：

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

[1]:http://activemq.apache.org/
[2]:http://activemq.apache.org/replicated-leveldb-store.html
