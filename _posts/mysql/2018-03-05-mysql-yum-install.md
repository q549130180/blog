---
layout: post
title:  MySQL for Linux Yum 安装
description: "这里我们来介绍使用 yum 的方式来安装 MySQL，yum 安装的方式是比较简洁的，不用去下载安装包，处理依赖等问题，基本上就是一键安装。"
modified: 2018-03-05 15:20:20
tags: [linux,MySQL,yum]
post_type: developer
blogid: 201803050001
categories: [MySQL ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 概述

### 1.1 简介

这里我们来介绍使用 yum 的方式来安装 MySQL，yum 安装的方式是比较简洁的，不用去下载安装包，处理依赖等问题，基本上就是一键安装

### 1.2 环境

- Cent OS 7.5
- MySQL 5.7

## 2. 安装

### 2.1 检查是否已安装

```
# 检查 MySQL 是否已安装
yum list installed | grep mysql
yum list installed mysql*

# 如果安装先进行卸载
yum remove mysql

# 查看当前 mysql 版本，看是否已安装
mysql --version
rpm -qa | grep mysql
```

### 2.2 安装mysql yum源

前往[MySQL Yum Repository](https://dev.mysql.com/downloads/repo/yum/)下载对应的yum源，CentOS 6 下载el6的源，CentOS 7 下载el7的源


```
wget http://dev.mysql.com/get/mysql80-community-release-el7-1.noarch.rpm
yum localinstall mysql80-community-release-el7-1.noarch.rpm

# 卸载方法
rpm -e mysql80-community-release-el7-1.noarch.rpm
```

检查是否安装成功

```
$ yum repolist enabled | grep "mysql.*-community.*"
mysql-connectors-community           MySQL Connectors Community              59
mysql-tools-community                MySQL Tools Community                   65
mysql80-community                    MySQL 8.0 Community Server              29
```

### 2.3 查看版本

选择要启用 MySQL 版本查看 MySQL 版本，执行

```
$ yum repolist all | grep mysql
mysql-cluster-7.5-community        MySQL Cluster 7.5 Community    disabled
mysql-cluster-7.5-community-source MySQL Cluster 7.5 Community -  disabled
mysql-cluster-7.6-community        MySQL Cluster 7.6 Community    disabled
mysql-cluster-7.6-community-source MySQL Cluster 7.6 Community -  disabled
mysql-connectors-community         MySQL Connectors Community     enabled:    59
mysql-connectors-community-source  MySQL Connectors Community - S disabled
mysql-tools-community              MySQL Tools Community          enabled:    65
mysql-tools-community-source       MySQL Tools Community - Source disabled
mysql-tools-preview                MySQL Tools Preview            disabled
mysql-tools-preview-source         MySQL Tools Preview - Source   disabled
mysql55-community                  MySQL 5.5 Community Server     disabled
mysql55-community-source           MySQL 5.5 Community Server - S disabled
mysql56-community                  MySQL 5.6 Community Server     disabled
mysql56-community-source           MySQL 5.6 Community Server - S disabled
mysql57-community                  MySQL 5.7 Community Server     disabled
mysql57-community-source           MySQL 5.7 Community Server - S disabled
mysql80-community                  MySQL 8.0 Community Server     enabled:    29
mysql80-community-source           MySQL 8.0 Community Server - S disabled
```

可以看到5.7版本默认是被禁用的，8.0版本时启用的

### 2.4 启动指定版本

可以通过类似下面的语句来启动和禁用某些版本

```
yum-config-manager --disable mysql80-community
yum-config-manager --enable mysql57-community
```

### 2.5 开始安装


```
yum install mysql-community-server
```

### 2.6 查看安装目录

```
$ whereis mysql
mysql: /usr/bin/mysql /usr/lib64/mysql /usr/share/mysql /usr/share/man/man1/mysql.1.gz
```

可以看到 MySQL 的安装目录是 /usr/bin/


### 2.7 启动mysql

```
$ service mysqld start

# 输出如下
Initializing MySQL database:                               [  OK  ]
Starting mysqld:                                           [  OK  ]

```

查看状态

```
$ service mysqld status
mysqld (pid  12235) is running...
```

### 2.8 查看初始密码

默认情况下MySQL是有个初始密码，知道了初始密码才能改密码。

```
$ grep 'temporary password' /var/log/mysqld.log
2018-11-30T08:01:46.182289Z 1 [Note] A temporary password is generated for root@localhost: Y4sLv7iWeh>!
```


### 2.9 配置

启动后我们需要简单配置一下 MySQL ，执行`mysql_secure_installation`允许您执行重要操作，如设置根密码、删除匿名用户等。


```
Enter password for user root: 
# 输入刚才获取到的密码（如果没有密码直接敲回车）

New password: 
# 输入新密码

Re-enter new password: 
# 确认输入

Change the password for root ? ((Press y|Y for Yes, any other key for No) : y
# 是否更改 root 密码？ 输入 y

Remove anonymous users? (Press y|Y for Yes, any other key for No) : y
# 要移除掉匿名用户吗？输入 y 表示愿意。

Disallow root login remotely? (Press y|Y for Yes, any other key for No) : y
# 是否允许 root 远程登录？ 输入y

Remove test database and access to it? (Press y|Y for Yes, any other key for No) : y
# 要去掉 test 数据库吗？输入 y 表示愿意。

Reload privilege tables now? (Press y|Y for Yes, any other key for No) : y
# 想要重新加载权限吗？输入 y 表示愿意。
```

到这里基本上的安装配置就结束了

### 2.10 修改 root 用户的访问权限

如果忘记密码或丢失密码可以使用如下方法进行修改


1. 以安全模式启动

```
mysqld_safe --skip-grant-tables &
```

2. 登录并修改

```
mysql -u root

use mysql;

# 修改密码
update mysql.user set authentication_string=password('dongxuqazwsx') where user='root';
# 修改访问权限
update mysql.user set host='%' where user='root';

# 退出安全模式，然后在进行启动
ps -ef | grep mysql
kill -9 

# 再登录之后如果提示使用alter修改密码，使用如下方式进行修改
ALTER USER 'root'@'%' IDENTIFIED BY 'dongxuqazwsx';
```


3. 修改密码时，如果只是修改为一个简单的密码，会报以下错误：

```
ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
```

这个其实与 `validate_password_policy` 的值有关。

`validate_password_policy` 有以下取值：

Policy | Tests Performed
--- | ---
0 or LOW | Length
1 or MEDIUM | Length; numeric, lowercase/uppercase, and special characters
2 or STRONG | Length; numeric, lowercase/uppercase, and special characters; dictionary file

默认是1，即MEDIUM，所以刚开始设置的密码必须符合长度，且必须含有数字，小写或大写字母，特殊字符。

有时候，只是为了自己测试，不想密码设置得那么复杂，譬如说，我只想设置root的密码为123456。

必须修改两个全局参数：

首先，修改 `validate_password_policy` 参数的值

```
mysql> set global validate_password_policy=0;
Query OK, 0 rows affected (0.00 sec)
```



##### 参考资料

- [MySQL for yum 安装](https://github.com/jaywcjlove/mysql-tutorial/blob/master/chapter2/2.2.md)
- [MySQL yum 安装官方文档](https://dev.mysql.com/doc/mysql-repo-excerpt/5.6/en/linux-installation-yum-repo.html)