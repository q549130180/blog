---
layout: post
title:  SVN服务器安装与使用
description: "SVN是Subversion的简称，是一个开放源代码的版本控制系统。本文将讲解SVN服务端的安装与使用。"
modified: 2016-06-06 17:20:20
tags: [SVN,Subversion]
post_type: developer
categories: [SVN ]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---




## 一、环境

- OS:Cent OS 7.0
- Subversion: 1.9.4


## 二、安装

官网：http://subversion.apache.org


安装Subversion`yum install subversion`


## 三、创建版本库

```
 mkdir SvnRepository
 cd SvnRepository

# 新建一个版本仓库
svnadmin create /snow/programs/SvnRepository

# 执行之后，SvnRepository文件夹内结构如下
[root@snow SvnRepository]# ll
total 16
drwxr-xr-x. 2 root root   51 Apr 28 19:33 conf
drwxr-sr-x. 6 root root 4096 Apr 28 19:33 db
-r--r--r--. 1 root root    2 Apr 28 19:33 format
drwxr-xr-x. 2 root root 4096 Apr 28 19:33 hooks
drwxr-xr-x. 2 root root   39 Apr 28 19:33 locks
-rw-r--r--. 1 root root  229 Apr 28 19:33 README.txt

```


进入conf目录

- authz 文件是权限控制文件
- passwd 是帐号密码文件
- svnserve.conf SVN服务配置文件

### 1.设置账户密码`vim passwd`

在[users]块中添加用户和密码，格式：帐号=密码，如:`ling = ling`


### 2.设置权限`vim authz`

在末尾添加如下代码：

```
[groups]
project_p = pm
project_s = server1,server2,server3
project_c = client1,client2,client3
project_t = test1,test1,test1

[/]
ling = rw
* =

[project:/]
@project_p = rw
* =

[project:/server]
@project_p = rw
@project_s = rw
* =

[project:/client]
@project_p = rw
@project_c = rw
* =

[project:/doc]
@project_p = rw
@project_s = r
@project_c = r
@project_t = r
* =
```

**说明：** 以上信息表示，只有project_p用户组有根目录的读写权。r表示对该目录有读权限，w表示对该目录有写权限，rw表示对该目录有读写权限。最后一行的* =表示，除了上面设置了权限的用户组之外，其他任何人都被禁止访问本目录。这个很重要，一定要加上！


### 3.修改svnserve.conf文件,让用户和策略配置升效.

svnserve.conf内容如下:

```
[general]
anon-access = none #匿名权限
auth-access = write  #授权用户可写
password-db = passwd #使用哪个文件作为账号文件
authz-db = authz  #使用哪个文件作为权限文件
realm = /snow/programs/SvnRepository # 认证空间名，版本库所在目录
```

### 4.启动SVN版本库

```
svnserve -d -r /snow/programs/SvnRepository
```

**注意：** 如果修改了svn配置，需要重启svn服务，步骤如下：

```
# ps -aux|grep svnserve
# kill -9 ID号
# svnserve -d -r /snow/programs/SvnRepository
```

### 5.测试服务器

```
[root@snow svntest]# svn co svn://10.0.2.15/
A    project
A    project/aa.txt
Checked out revision 1.

# 测试提交
[root@snow svntest]# svn add project/
A         project
A         project/aa.txt
[root@snow svntest]# svn commit project/ -m "test"
Adding         project
Adding         project/aa.txt
Transmitting file data .
Committed revision 1.
# 提交测试成功

```
