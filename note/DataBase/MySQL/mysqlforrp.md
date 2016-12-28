---
layout: post
title:  MySQL5.7.17 RPM 包安装
description: ""
modified: 2016-12-28 15:20:20
tags: [MySQL]
post_type: developer
series: MySQL系列文章
categories: [MySQL]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---


## 一、准备

### 1、环境

- OS:Cent OS 7
- MySQL:5.7.17



## 二、MySQL 安装与配置

如果你系统已经有MySQL，如一般centos自带mysql5.1系列，那么你需要删除它，先检查一下系统是否自带mysql

yum list installed | grep mysql

删除系统自带的mysql及其依赖命令

yum -y remove mysql-libs.x86_64

需要先卸载掉mariadb，以下为卸载mariadb步骤

rpm -qa | grep mariadb

当检查出了系统自带的mariadb后如版本为：mariadb-libs-5.5.37-1.el7_0.x86_64 那么使用以下命令：

rpm -e --nodeps mariadb-libs-5.5.37-1.el7_0.x86_64


MySql官网：http://www.mysql.com/;
也可在此处直接[下载](http://dev.mysql.com/downloads/mysql/)
选择Red Hat Enterprise Linux / Oracle Linux

下载这四个包
mysql-community-common-5.7.17-1.el7.x86_64.rpm
mysql-community-libs-5.7.17-1.el7.x86_64.rpm
mysql-community-client-5.7.17-1.el7.x86_64.rpm
mysql-community-server-5.7.17-1.el7.x86_64.rpm


依次安装
rpm -ivh mysql-community-common-5.7.17-1.el7.x86_64.rpm
rpm -ivh mysql-community-libs-5.7.17-1.el7.x86_64.rpm
rpm -ivh mysql-community-client-5.7.17-1.el7.x86_64.rpm
rpm -ivh mysql-community-server-5.7.17-1.el7.x86_64.rpm



启动
service mysqld start
或
systemctl start mysqld


Step1: 停止mysqld服务并使用mysqld safe启动

mysql5.7安装完后如何开启远程root包括远程用户权限


tep1: 停止mysqld服务并使用mysqld safe启动

service mysqld stop
mysqld_safe --user=mysql --skip-grant-tables --skip-networking &


RHEL7.0系列的发行版（例如CentOs 7）,特征是使用了systemd来代替原有的init，作为第一支启动的程序。此时网络上面所说的mysqld_secure已经不可使用。但是查看官方文档后，得知在这种情况下mysqld可以支持部分mysqld_safe的参数，命令如下：

mysqld   --user=mysql --skip-grant-tables --skip-networking &


Step2：登录mysql


此时，你在mysql服务器上使用

mysql -uroot -p


就可以登录mysql了

更改mysql root的密码

update mysql.user set authentication_string=password('newpassword') where user='root';
flush privileges;



建立可供远程连接的root用户


GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'ur password here' WITH GRANT OPTION;



1、数据库目录　/var/lib/mysql/
2、配置文件　　/usr/share/mysql（mysql.server命令及配置文件）
3、相关命令　　/usr/bin (mysqladmin mysqldump等命令)
4、错误log日志 /var/log/
5、pid文件     /var/run/mysqld/mysqld.pid
6、my.cnf      /etc/my.cnf
