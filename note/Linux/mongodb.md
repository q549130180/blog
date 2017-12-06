
官网下载地址：

https://www.mongodb.com/download-center?jmp=nav#community

选择相应的社区版本

复制下载url

下载
```
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel70-3.4.10.tgz
```

建立数据库文件夹和log文件
mkdir data logs
touch logs/mongodb.log

启动mongodb
./mongod --dbpath=/home/ling/developer/mongodb-linux-x86_64-rhel70-3.4.10/data --logpath=/home/ling/developer/mongodb-linux-x86_64-rhel70-3.4.10/logs/mongodb.log --logappend --rest --fork



--dbpath 数据库路径
--logpath 日志文件路径
--rest 开启web界面
--fork 在后台运行
--master 指定为主机器
--slave 指定为从机器
--source 指定主机器的IP地址
--pologSize 指定日志文件大小不超过64M.因为resync是非常操作量大且耗时，最好通过设置一个足够大的oplogSize来避免resync(默认的 oplog大小是空闲磁盘大小的5%)。
--logappend 日志文件末尾添加
--port 启用端口号
--only 指定只复制哪一个数据库
--slavedelay 指从复制检测的时间间隔
--auth 是否需要验证权限登录(用户名和密码)


如果你的MongoDB运行端口使用默认的27017，你可以在端口号为28017访问web用户界面，即地址为：http://localhost:28017。
