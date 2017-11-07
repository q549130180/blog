一背景



二、架构

两种方案

有kafka

没有kafka

三、实现

3.1 安装Filebeat


```yml

##################$$$###### Filebeat Configuration ############################

filebeat.prospectors:

#------------------------------ Log prospector --------------------------------
- input_type: log

  # 监控路径
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


3.2 安装Logstash




关于 Grok 的语法，可以参考
https://kibana.logstash.es/content/
https://grokdebug.herokuapp.com/




3.3 安装Elasticsearch

3.4 安装 Cerebro


3.5 安装 Kibana
