Graylog——日志聚合工具中的后起之秀


https://testerhome.com/topics/3026

官网：https://www.graylog.org/



整套依赖：

Java JDK 1.8 +
Graylog 提供 graylog 对外接口， CPU 密集
Elasticsearch 日志文件的持久化存储和检索， IO 密集
MongoDB 只是存储一些 Graylog 的配置

注意：不要用使用root用户进行如下操作





## MongoDB 安装




## Elasticsearch安装

下载Elasticsearch
https://www.elastic.co/downloads

tar -zxvf elasticsearch-5.6.3.tar.gz
cd elasticsearch-5.6.3

修改配置文件`vim config/elasticsearch.yml`,找到cluster.name修改如下
cluster.name: graylog


进入到bin目录下启动,
作为守护进程启动,加上 -p 参数将进程id保存到es.pid文本文件里面。
elasticsearch -d -p es.pid

通过 es.pid 文件中的进程id 将其杀掉

kill `cat es.pid`

查看日志
tail -f logs/elasticsearch.log

## Graylog-Server安装

raylog2 之后server和web在一起了


$ sudo rpm -Uvh https://packages.graylog2.org/repo/packages/graylog-2.3-repository_latest.rpm
$ sudo yum install graylog-server



现在我们来设置Graylog管理员的密钥,需要安装pwgen工具。配置文件位于/etc/graylog/server/server.conf目录，需要修改password_secret参数：

安装pwgen，我们使用它生成随机密码：
yum -y install epel-release
yum -y install pwgen

`pwgen -N 1 -s 96`生成的秘钥放到server.conf配置文件的password_secret参数中

`echo -n 123456 | sha256sum `生成的密码放到server.conf配置文件的root_password_sha2参数中

elasticsearch_cluster_name = graylog


$ sudo chkconfig --add graylog-server
$ sudo systemctl daemon-reload
$ sudo systemctl enable graylog-server.service
$ sudo systemctl start graylog-server.service

cat /var/log/graylog-web/application.log




手动安装：https://www.howtoing.com/how-to-Install-graylog2-and-elasticsearch-on-ubuntu-15-10

官方doc：http://docs.graylog.org/en/latest/pages/installation/os/centos.html

https://testerhome.com/topics/3026

https://www.3mc2.com/the-turorail-install-graylog2-under-centos7-linux.html

http://blog.topspeedsnail.com/archives/4066

https://github.com/jaywcjlove/handbook/blob/master/CentOS/Elasticsearch%E5%AE%89%E8%A3%85%E7%BB%B4%E6%8A%A4.md
