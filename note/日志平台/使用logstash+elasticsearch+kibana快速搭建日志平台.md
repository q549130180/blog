ELK简介即Elasticsearch + Logstash + Kibana


下载地址：  
https://www.elastic.co/downloads


elasticsearch的安装

```shell


groupadd elsearch

useradd elsearch -g elsearch -p elasticsearch


#如果文件夹都是root用户和用户组的修改文件夹用户和组

#修改用户
chown elsearch elasticsearch-5.3.0/
#修改组
chgrp elsearch elasticsearch-5.3.0/

su elsearch


./elasticsearch

```

安装nodejs

官网下载nodejs

```shell
# 解压
tar zxvf node-v6.10.3.tar.gz

# 安装
cd node-v0.10.24
./configure --prefix=/usr/local/node-v6.10.3
make && make install

配置环境变量
vim /etc/profile

#set for nodejs
export NODE_HOME=/usr/local/node-v6.10.3
export PATH=$NODE_HOME/bin:$PATH

# :wq保存并退出，编译/etc/profile 使配置生效
source /etc/profile

# 验证是否安装配置成功
node -v
```


安装elasticsearch-head
https://github.com/mobz/elasticsearch-head
```
git clone git://github.com/mobz/elasticsearch-head.git
cd elasticsearch-head
npm install
npm run start
open http://localhost:9100/
```






Logstash安装



```

```






参考资料：
全文搜索引擎 Elasticsearch 入门教程：http://www.ruanyifeng.com/blog/2017/08/elasticsearch.html
