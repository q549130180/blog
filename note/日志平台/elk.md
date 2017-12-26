## 一背景

ElasticSearch
ElasticSearch是一个基于Lucene的搜索服务器。它提供了一个分布式多用户能力的全文搜索引擎，基于RESTful web接口。它的特点有：分布式，零配置，自动发现，索引自动分片，索引副本机制，restful风格接口等。

Logstash
Logstash数据分析工具，它可以对系统生成的的日志进行采集、分析，存储。2013 年，Logstash 被 Elasticsearch 公司收购，ELK Stack 正式成为官方用语。

kibana
Kibana是一个开源的分析与可视化平台，用来搜索、查看存储在Elasticsearch索引中的数据。

## 二、架构

两种方案

有kafka

没有kafka

## 三、实现

### 3.1 安装Filebeat

tar -zxvf filebeat-5.6.3-linux-x86_64.tar.gz

```yml

##################$$$###### Filebeat Configuration ############################

filebeat.prospectors:
#------------------------------ Log prospector --------------------------------
- input_type: log
  # 监控路径,目录下所有以 .log 结尾的文件，并且将增量日志转发到 Kafka 集群。
  paths:
    - /path/to/nginx/access/*.log
  # 字符编码
  encoding: utf-8
  # 类型将在“type”字段中发布。Elasticsearch输出,
  document_type: my-nginx-log
  # 扫描频率
  scan_frequency: 10s
  # 定义获取文件时每个收割机使用的缓冲区大小
  harvester_buffer_size: 16384
  tail_files: true
#------------------------------- Kafka output ---------------------------------
output.kafka:
  enabled: true
  hosts: ["your.kafka.server.adddress:9092","your.other.kafka.server.adddress:9092"]
  topic: elk-%{[type]}
  worker: 2
  keep_alive: 60
  required_acks: 0
#----------------------------- Console output ---------------------------------
output.console:
  # Boolean flag to enable or disable the output module.
  enabled: false
  # Pretty print json event
  pretty: false
logging.to_files: true
logging.files:
```


nohup ./filebeat -c ./filebeat.yml &

Kafka需要Zookeeper的支持，Zookeeper安装请看《》


### 安装kafka

```yml


############################# Server Basics #############################

# The id of the broker. This must be set to a unique integer for each broker.
broker.id=0

# Switch to enable topic deletion or not, default value is false
delete.topic.enable=true

############################# Socket Server Settings #############################

# The address the socket server listens on. It will get the value returned from
# java.net.InetAddress.getCanonicalHostName() if not configured.
#   FORMAT:
#     listeners = security_protocol://host_name:port
#   EXAMPLE:
#     listeners = PLAINTEXT://your.host.name:9092
listeners=PLAINTEXT://your.ip.address:9092

# Hostname and port the broker will advertise to producers and consumers. If not set,
# it uses the value for "listeners" if configured.  Otherwise, it will use the value
# returned from java.net.InetAddress.getCanonicalHostName().
#advertised.listeners=PLAINTEXT://your.host.name:9092

# The number of threads handling network requests
num.network.threads=3

# The number of threads doing disk I/O
num.io.threads=8

# The send buffer (SO_SNDBUF) used by the socket server
socket.send.buffer.bytes=102400

# The receive buffer (SO_RCVBUF) used by the socket server
socket.receive.buffer.bytes=102400

# The maximum size of a request that the socket server will accept (protection against OOM)
socket.request.max.bytes=104857600

############################# Log Basics #############################

# A comma seperated list of directories under which to store log files
log.dirs=/path/to/data/kafka

# The default number of log partitions per topic. More partitions allow greater
# parallelism for consumption, but this will also result in more files across
# the brokers.
num.partitions=2

# The number of threads per data directory to be used for log recovery at startup and flushing at shutdown.
# This value is recommended to be increased for installations with data dirs located in RAID array.
num.recovery.threads.per.data.dir=1

############################# Log Flush Policy #############################

# Messages are immediately written to the filesystem but by default we only fsync() to sync
# the OS cache lazily. The following configurations control the flush of data to disk.
# There are a few important trade-offs here:
#    1. Durability: Unflushed data may be lost if you are not using replication.
#    2. Latency: Very large flush intervals may lead to latency spikes when the flush does occur as there will be a lot of data to flush.
#    3. Throughput: The flush is generally the most expensive operation, and a small flush interval may lead to exceessive seeks.
# The settings below allow one to configure the flush policy to flush data after a period of time or
# every N messages (or both). This can be done globally and overridden on a per-topic basis.

# The number of messages to accept before forcing a flush of data to disk
#log.flush.interval.messages=10000

# The maximum amount of time a message can sit in a log before we force a flush
#log.flush.interval.ms=1000

############################# Log Retention Policy #############################

# The following configurations control the disposal of log segments. The policy can
# be set to delete segments after a period of time, or after a given size has accumulated.
# A segment will be deleted whenever *either* of these criteria are met. Deletion always happens
# from the end of the log.

# The minimum age of a log file to be eligible for deletion
log.retention.hours=24

# A size-based retention policy for logs. Segments are pruned from the log as long as the remaining
# segments don't drop below log.retention.bytes.
#log.retention.bytes=1073741824

# The maximum size of a log segment file. When this size is reached a new log segment will be created.
log.segment.bytes=1073741824

# The interval at which log segments are checked to see if they can be deleted according
# to the retention policies
log.retention.check.interval.ms=300000

############################# Zookeeper #############################

# Zookeeper connection string (see zookeeper docs for details).
# This is a comma separated host:port pairs, each corresponding to a zk
# server. e.g. "127.0.0.1:3000,127.0.0.1:3001,127.0.0.1:3002".
# You can also append an optional chroot string to the urls to specify the
# root directory for all kafka znodes.
# zookeeper 地址
zookeeper.connect=localhost:2181

# Timeout in ms for connecting to zookeeper
zookeeper.connection.timeout.ms=6000
```




启动 Kafka Server：(指定 JMX_PORT 端口，可以通过 Kafka-manager 获取统计信息)

`JMX_PORT=9001 nohup ./bin/kafka-server-start.sh config/server.properties &`


### 安装 Kafka-Manager
kafka-manager 是 Yahoo 公司开源的一个 kafka 集群管理工具。

https://github.com/yahoo/kafka-manager/releases

通过 sbt 编译
./sbt clean dist

通过 cd ~进入当前用户目录，然后通过命令mkdir .sbt创建.sbt目录，进入创建的该目录，使用vi创建repositories文件，编辑内容如下：

```
[repositories]
local
aliyun: http://maven.aliyun.com/nexus/content/groups/public
typesafe: http://repo.typesafe.com/typesafe/ivy-releases/, [organization]/[module]/(scala_[scalaVersion]/)(sbt_[sbtVersion]/)[revision]/[type]s/[artifact](-[classifier]).[ext], bootOnly
```


修改配置文件 conf/application.conf 即可运行：

bin/kafka-manager -Dconfig.file=/path/to/application.conf -Dhttp.port=8080



然后，通过浏览器访问：

```conf

# Copyright 2015 Yahoo Inc. Licensed under the Apache License, Version 2.0
# See accompanying LICENSE file.

# This is the main configuration file for the application.
# ~~~~~

# Secret key
# ~~~~~
# The secret key is used to secure cryptographics functions.
# If you deploy your application to several instances be sure to use the same key!
play.crypto.secret="^<csmm5Fx4d=r2HEX8pelM3iBkFVv?k[mc;IZE<_Qoq8EkX_/7@Zt6dP05Pzea3U"
play.crypto.secret=${?APPLICATION_SECRET}

# The application languages
# ~~~~~
play.i18n.langs=["en"]

play.http.requestHandler = "play.http.DefaultHttpRequestHandler"
play.http.context = "/"
play.application.loader=loader.KafkaManagerLoader

kafka-manager.zkhosts="localhost:2181"
kafka-manager.zkhosts=${?ZK_HOSTS}
pinned-dispatcher.type="PinnedDispatcher"
pinned-dispatcher.executor="thread-pool-executor"
application.features=["KMClusterManagerFeature","KMTopicManagerFeature","KMPreferredReplicaElectionFeature","KMReassignPartitionsFeature"]

akka {
  loggers = ["akka.event.slf4j.Slf4jLogger"]
  loglevel = "INFO"
}


basicAuthentication.enabled=false
basicAuthentication.username="admin"
basicAuthentication.password="password"
basicAuthentication.realm="Kafka-Manager"


kafka-manager.consumer.properties.file=${?CONSUMER_PROPERTIES_FILE}

```


### 3.2 安装Logstash


vim logstash.conf

```conf
### INPUTS
input {

    kafka  {
      codec => "json"
      topics_pattern => "elk-.*"
      bootstrap_servers => "172.16.165.100:9092,172.16.165.100:9092"
      auto_offset_reset => "latest"
      group_id => "logstash-g1"
    }

}


### FILTERS
filter {
  grok {
    #获取 Nginx 日志字段
    match => {
      "message" => [
        #Nginx access log 格式
          '%{IPV4:clientip} - (?:%{USERNAME}|-) \[%{HTTPDATE:[@metadata][timestamp]}\] %{WORD:method} %{URIPATHPARAM:request} HTTP/%{NUMBER} "%{NUMBER:response_code}" (?:%{NUMBER:bytes}|-) (?:%{NUMBER:response_time}|-) "(?:%{URI:http_referer}|-)" %{QS:agent}'
      ]
    }

    #减少冗余数据
    remove_field => [ "message" ]
  }


  #通用 Nginx 访问日志
  if [request] {

      #获取 日志 时间
      date { match => [ "[@metadata][timestamp]", "dd/MMM/yyyy:HH:mm:ss Z" ] }
      mutate {
        #转换数据类型
        convert => [
          "response_code" , "integer",
              "bytes" , "integer",
              "response_time", "float"
          ]
      }

      #获取 参数
      ruby {
          init => "@kname = ['url_path','url_args']"
          code => "
            new_event = LogStash::Event.new(Hash[@kname.zip(event.get('request').split('?'))])
            new_event.remove('@timestamp')
            event.append(new_event)
            "
      }

      if [url_path] =~ /\.js|css|jpeg|jpg|png|gif|ico|swf$/ {
        drop {}
      }

      if [url_args] {
        kv {
              prefix => "url_param_"
              source => "url_args"
              field_split => "&"

              #只存储感兴趣参数
              #include_keys => [ "uid", "vn" ]
              remove_field => [ "url_args" ]
          }
      }else{
        mutate {
          #减少冗余数据
          remove_field => [ "url_args" ]
        }
      }

      #url 解码
      urldecode {
        all_fields => true
      }

  }else{

    #忽略其他请求
    #drop {}
  }
}


### OUTPUTS
output {

  elasticsearch {
    hosts => ["172.16.165.100:9200","172.16.165.100:9200"]
    index => "logstash-%{type}-%{+YYYY.MM.dd}"
  }

  #stdout { codec => rubydebug }

}
```

nohup ./bin/logstash -f ./logstash.conf &



关于 Grok 的语法，可以参考
https://kibana.logstash.es/content/
https://grokdebug.herokuapp.com/




### 3.3 安装Elasticsearch

mkdir data logs

vim elasticsearch.yml

```
# ======================== Elasticsearch Configuration =========================
#
# NOTE: Elasticsearch comes with reasonable defaults for most settings.
#       Before you set out to tweak and tune the configuration, make sure you
#       understand what are you trying to accomplish and the consequences.
#
# The primary way of configuring a node is via this file. This template lists
# the most important settings you may want to configure for a production cluster.
#
# Please see the documentation for further information on configuration options:
# <http://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration.html>
#
# ---------------------------------- Cluster -----------------------------------
#
# Use a descriptive name for your cluster:
#
cluster.name: my-application
#
# ------------------------------------ Node ------------------------------------
#
# Use a descriptive name for the node:
#
node.name: node-1
#
# Add custom attributes to the node:
#
#node.attr.rack: r1
#
# ----------------------------------- Paths ------------------------------------
#
# Path to directory where to store the data (separate multiple locations by comma):
#
path.data: /path/to/data/elasticsearch
#
# Path to log files:
#
path.logs: /path/to/logs/elasticsearch
#
# ----------------------------------- Memory -----------------------------------
#
# Lock the memory on startup:
#
#bootstrap.memory_lock: true
#
# Make sure that the heap size is set to about half the memory available
# on the system and that the owner of the process is allowed to use this
# limit.
#
# Elasticsearch performs poorly when the system is swapping the memory.
#
# ---------------------------------- Network -----------------------------------
#
# Set the bind address to a specific IP (IPv4 or IPv6):
#
network.host: your.ip.address
#
# Set a custom port for HTTP:
#
http.port: 9200
#
# For more information, see the documentation at:
# <http://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html>
#
# --------------------------------- Discovery ----------------------------------
#
# Pass an initial list of hosts to perform discovery when new node is started:
# The default list of hosts is ["127.0.0.1", "[::1]"]
#
discovery.zen.ping.unicast.hosts: ["your.elasticsearch.cluster.node.1", "your.elasticsearch.cluster.node.2"]
#
# Prevent the "split brain" by configuring the majority of nodes (total number of nodes / 2 + 1):
#
#discovery.zen.minimum_master_nodes: 3
#
# For more information, see the documentation at:
# <http://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery.html>
#
# ---------------------------------- Gateway -----------------------------------
#
# Block initial recovery after a full cluster restart until N nodes are started:
#
#gateway.recover_after_nodes: 3
#
# For more information, see the documentation at:
# <http://www.elastic.co/guide/en/elasticsearch/reference/current/modules-gateway.html>
#
# ---------------------------------- Various -----------------------------------
#
# Disable starting multiple nodes on a single system:
#
#node.max_local_storage_nodes: 1
#
# Require explicit names when deleting indices:
#
#action.destructive_requires_name: true
#
#
xpack.security.enabled: false
indices.memory.index_buffer_size: 15%
```

指定文档和日志的存储路径以及监听的地址和端口。

注意，应当保证有足够的磁盘空间来存储文档，否则 ES 将拒绝写入新数据。

安装 x-pack 插件：

`bin/elasticsearch-plugin install x-pack`


另外，不能使用 root 用户启动 Elasticsearch 进程，建议新建账户 elasticsearch。

环境变量 ES_JAVA_OPTS 被读取为 Elasticsearch 的最大内存空间，一般设置为你机器内存的一半即可，启动 ES 服务：

`ES_JAVA_OPTS="-Xms1g -Xmx1g" nohup ./bin/elasticsearch &`



如果启动 Elasticsearch 出现以下错误提示：
```
max virtual memory areas vm.max_map_count [65530] likely too low, increase to at least [262144]

max file descriptors [4096] for elasticsearch process likely too low, increase to at least [65536]
```
那么需要修改系统配置：

vi /etc/sysctl.conf 修改虚拟内存配置：
vm.max_map_count = 262144

使之生效
sudo sysctl -p

查看是否生效
sysctl -a|grep vm.max_map_count

需要切换到root用户修改，在切换到普通用户
vi /etc/security/limits.conf 修改 文件描述符限制：

```
* soft nofile 65536
* hard nofile 65536
* soft nproc 2048
* hard nproc 4096
```

ulimit -Hn


然后，退出终端，重新使用 elasticsearch 账户登录，启动 Elasticsearch 后，通过浏览器访问 9200 端口，查看 Elasticsearch 状态：

### 3.4 安装 Cerebro
erebro 时一个第三方的 Elasticsearch 集群管理软件，可以方便地查看集群状态：

下载地址：https://github.com/lmenezes/cerebro

### 3.5 安装 Kibana

```yml
# Kibana is served by a back end server. This setting specifies the port to use.
server.port: 5601

# Specifies the address to which the Kibana server will bind. IP addresses and host names are both valid values.
# The default is 'localhost', which usually means remote machines will not be able to connect.
# To allow connections from remote users, set this parameter to a non-loopback address.
server.host: "your.server.address"

# Enables you to specify a path to mount Kibana at if you are running behind a proxy. This only affects
# the URLs generated by Kibana, your proxy is expected to remove the basePath value before forwarding requests
# to Kibana. This setting cannot end in a slash.
#server.basePath: ""

# The maximum payload size in bytes for incoming server requests.
#server.maxPayloadBytes: 1048576

# The Kibana server's name.  This is used for display purposes.
server.name: "your-hostname"

# The URL of the Elasticsearch instance to use for all your queries.
elasticsearch.url: "http://your.elasticsearch.server:9200"

# When this setting’s value is true Kibana uses the hostname specified in the server.host
# setting. When the value of this setting is false, Kibana uses the hostname of the host
# that connects to this Kibana instance.
#elasticsearch.preserveHost: true

# Kibana uses an index in Elasticsearch to store saved searches, visualizations and
# dashboards. Kibana creates a new index if the index doesn’t already exist.
kibana.index: ".kibana"

# The default application to load.
#kibana.defaultAppId: "discover"

# If your Elasticsearch is protected with basic authentication, these settings provide
# the username and password that the Kibana server uses to perform maintenance on the Kibana
# index at startup. Your Kibana users still need to authenticate with Elasticsearch, which
# is proxied through the Kibana server.
elasticsearch.username: "elastic"
elasticsearch.password: "changeme"

# Paths to the PEM-format SSL certificate and SSL key files, respectively. These
# files enable SSL for outgoing requests from the Kibana server to the browser.
#server.ssl.cert: /path/to/your/server.crt
#server.ssl.key: /path/to/your/server.key

# Optional settings that provide the paths to the PEM-format SSL certificate and key files.
# These files validate that your Elasticsearch backend uses the same key files.
#elasticsearch.ssl.cert: /path/to/your/client.crt
#elasticsearch.ssl.key: /path/to/your/client.key

# Optional setting that enables you to specify a path to the PEM file for the certificate
# authority for your Elasticsearch instance.
#elasticsearch.ssl.ca: /path/to/your/CA.pem

# To disregard the validity of SSL certificates, change this setting’s value to false.
#elasticsearch.ssl.verify: true

# Time in milliseconds to wait for Elasticsearch to respond to pings. Defaults to the value of
# the elasticsearch.requestTimeout setting.
#elasticsearch.pingTimeout: 1500

# Time in milliseconds to wait for responses from the back end or Elasticsearch. This value
# must be a positive integer.
#elasticsearch.requestTimeout: 30000

# List of Kibana client-side headers to send to Elasticsearch. To send *no* client-side
# headers, set this value to [] (an empty list).
#elasticsearch.requestHeadersWhitelist: [ authorization ]

# Header names and values that are sent to Elasticsearch. Any custom headers cannot be overwritten
# by client-side headers, regardless of the elasticsearch.requestHeadersWhitelist configuration.
#elasticsearch.customHeaders: {}

# Time in milliseconds for Elasticsearch to wait for responses from shards. Set to 0 to disable.
#elasticsearch.shardTimeout: 0

# Time in milliseconds to wait for Elasticsearch at Kibana startup before retrying.
#elasticsearch.startupTimeout: 5000

# Specifies the path where Kibana creates the process ID file.
#pid.file: /var/run/kibana.pid

# Enables you specify a file where Kibana stores log output.
#logging.dest: stdout

# Set the value of this setting to true to suppress all logging output.
#logging.silent: false

# Set the value of this setting to true to suppress all logging output other than error messages.
#logging.quiet: false

# Set the value of this setting to true to log all events, including system usage information
# and all requests.
#logging.verbose: false

# Set the interval in milliseconds to sample system and process performance
# metrics. Minimum is 100ms. Defaults to 5000.
#ops.interval: 5000
#
xpack.security.enabled: false
```



安装 x-pack 插件：

bin/kibana-plugin install x-pack

启动 Kibana 进程：

nohup ./bin/kibana &
