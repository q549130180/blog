---
layout: post
title:  Supervisor进程管理工具安装配置
description: "Supervisor 是一个用 Python 写的进程管理工具，可以很方便的用来启动、重启、关闭进程（不仅仅是 Python 进程）。除了对单个进程的控制，还可以同时启动、关闭多个进程，比如很不幸的服务器出问题导致所有应用程序都被杀死，此时可以用 supervisor 同时启动所有应用程序而不是一个一个地敲命令启动。可以说是很好的替换的系统的nohup ...... &或系统服务systemd"
modified: 2018-05-07 15:20:20
tags: [Supervisor,Linux,Cent OS]
post_type: developer
categories: [Linux ]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---

## 1. 背景

### 1.1 概述
[Supervisor][2] 是一个用 Python 写的进程管理工具，可以很方便的用来启动、重启、关闭进程（不仅仅是 Python 进程）。除了对单个进程的控制，还可以同时启动、关闭多个进程，比如很不幸的服务器出问题导致所有应用程序都被杀死，此时可以用 supervisor 同时启动所有应用程序而不是一个一个地敲命令启动。

可以说是很好的替换的系统的`nohup ...... &`或系统服务`systemd`

[Supervisor][2]相当强大，提供了很丰富的功能，不过我们可能只需要用到其中一小部分。安装完成之后，可以编写配置文件，来满足自己的需求。为了方便，我们把配置分成两部分：`supervisord`（supervisor是一个C/S模型的程序，这是server端，对应的有client端：`supervisorctl`）和应用程序（即我们要管理的程序）。


Supervisor 只能管理在前台运行的程序，所以如果应用程序有后台运行的选项，需要关闭。


### 1.2 环境

- Cnet OS 7
- Python 2.X




## 2. 安装

##### 1. 使用Python的`Setuptools`软件包来安装

```bash
sudo yum -y install python-setuptools
sudo easy_install supervisor
```

##### 2. 查看安装结果`supervisord -v`

```
3.3.4
```

默认安装的版本是最新版（3.3.4）

##### 3. 生成配置文件`supervisord.conf`,如果不加路径则默认生成到用户目录`~/supervisord.conf`

```bash
echo_supervisord_conf > supervisord.conf
```

##### 4. 创建Supervisor的工作目录

```
mkdir ~/developer/supervisor
mkdir ~/developer/supervisor/conf.d
mv ~/supervisord.conf ~/developer/supervisor
```

##### 5. 编辑配置文件`vim ~/developer/supervisor/supervisord.conf`

修改`include`配置，去除注释,`include`中的`files`为自己的配置文件存放地址。

```conf
[include]
files = /home/ling/developer/supervisor/conf.d/*.conf
```

> `conf.d`为应用的配置文件存放目录

修改 sock 文件位置，避免被系统删除

```
[unix_http_server]
file=/var/run/supervisor.sock   ; 修改为 /var/run 目录，避免被系统删除

[supervisorctl]
serverurl=unix:///var/run/supervisor.sock ; 修改为 /var/run 目录，避免被系统删除
```

## 3. 启动服务

```bash
sudo supervisord -c ~/developer/supervisor/supervisord.conf
```

##### 1. 查看服务

```bash
ps -ef | grep supervisord
ling      3419     1  0 02:50 ?        00:00:00 /usr/bin/python /usr/bin/supervisord -c /home/ling/developer/supervisor/supervisord.conf
```


##### 2. 关闭supervisor

```bash
sudo supervisorctl shutdown
```

## 4. program配置文件

配置说明

```
;*为必须填写项
;*[program:应用名称]
[program:cat]
;*命令路径,如果使用python启动的程序应该为 python /home/test.py,
;不建议放入/home/user/, 对于非user用户一般情况下是不能访问
command=/bin/cat
;当numprocs为1时,process_name=%(program_name)s
;当numprocs>=2时,%(program_name)s_%(process_num)02d
process_name=%(program_name)s
;使用supervisor还有一个更大的好处就是，可以快速开启多个进程，配置参数如下：
;进程数量,表示对同一个配置开启1个线程。
numprocs=1
;执行目录,若有/home/supervisor_test/test1.py
;将directory设置成/home/supervisor_test
;则command只需设置成python test1.py
;否则command必须设置成绝对执行目录
directory=/tmp
;掩码:--- -w- -w-, 转换后rwx r-x w-x
umask=022
;优先级,值越高,最后启动,最先被关闭,默认值999
priority=999
;如果是true,当supervisor启动时,程序将会自动启动
autostart=true
;*自动重启
autorestart=true
;启动延时执行,默认1秒
startsecs=10
;启动尝试次数,默认3次
startretries=3
;当退出码是0,2时,执行重启,默认值0,2
exitcodes=0,2
;停止信号,默认TERM
;中断:INT(类似于Ctrl+C)(kill -INT pid),退出后会将写文件或日志(推荐)
;终止:TERM(kill -TERM pid)
;挂起:HUP(kill -HUP pid),注意与Ctrl+Z/kill -stop pid不同
;从容停止:QUIT(kill -QUIT pid)
;KILL, USR1, USR2其他见命令(kill -l),说明1
stopsignal=TERM
stopwaitsecs=10
;*以root用户执行
user=root
;有时候用 Supervisor 托管的程序还会有子进程（如 Tornado），如果只杀死主进程，子进程就可能变成孤儿进程。
;通过这两项配置(改为true)来确保所有子进程都能正确停止,默认是false：
stopasgroup=false
killasgroup=false
;重定向,把stderr重定向到stdout，默认false；
redirect_stderr=false
;标准日志输出
stdout_logfile=/a/path
;标准日志文件大小，默认50MB
stdout_logfile_maxbytes=1MB
;标准日志文件大小，默认50MB
stdout_logfile_backups=10
stdout_capture_maxbytes=1MB
;标准日志输出
stderr_logfile=/a/path
stderr_logfile_maxbytes=1MB
stderr_logfile_backups=10
stderr_capture_maxbytes=1MB
;环境变量设置
environment=A="1",B="2"
serverurl=AUTO
```

## 5. `supervisorctl`使用

##### 配置文件立即生效：

修改的配置文件生效，设置`autostart=true`的程序，会自动启动

```bash
sudo supervisorctl update
```

或

```bash
sudo supervisorctl reload
```

##### 查看后台进程

```bash
sudo supervisorctl status
```

##### 对应用的控制

- 启动全部应用`sudo supervisorctl start all`
- 关闭全部应用`sudo supervisorctl stop all`
- 重启全部应用`sudo supervisorctl restart all`

> 将`all`换成相应的program名称，则就是对相应的程序进行启动、关闭和重启

## 5. 实例

以Jenkins为例启动进程

##### 1. 编辑配置文件`vim /home/ling/developer/supervisor/conf.d/jenkisn.conf`,写入如下内容

```conf
[program:jenkins]
command=java -jar jenkins.war --httpPort=8888
process_name=%(program_name)s
numprocs=1
directory=/home/ling/developer/jenkins
user=ling
autostart=true
autorestart=true
startsecs=10
startretries=5
redirect_stderr = true
stdout_logfile=/home/ling/developer/jenkins/logs/jenkins-out.log
stderr_logfile=/home/ling/developer/jenkins/logs/jenkins-err.log
stdout_logfile_maxbytes = 20MB
stdout_logfile_backups = 20
```

##### 2. 立即生效`sudo supervisorctl update`

```
jenkins: added process group
```

##### 2. 查看结果`sudo supervisorctl status`

```
jenkins                          RUNNING   pid 4555, uptime 19:21:53
```


## 6. 故障处理

`supervisord`的默认配置文件是放在`/etc/supervisord.conf`下面的，如果使用`supervisorctl`无法找到配置文件，`supervisorctl` 无法获知与`supervisord` 该如何通讯，使用`supervisorctl`时你可能会看到如下错误

```
http://localhost:9001 refused connection
```
处理解决办法：

1. 使用`-c`指定配置文件位置

```
supervisorctl -c /path/to/supervisord.conf status
```

2. 将配置文件链接到`/etc`目录下

```
ln -s /path/to/supervisord.conf /etc/
```







##### 参考资料

- [Supervisor GitHub][1]
- [Supervisor 官网][2]
- [Supervisor 官方配置文档][3]

[1]:https://github.com/Supervisor/supervisor
[2]:http://supervisord.org/
[3]:http://supervisord.org/configuration.html#program-x-section-settings
