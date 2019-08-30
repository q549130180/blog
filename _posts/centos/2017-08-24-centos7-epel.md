---
layout: post
title:  Cent OS 安装epel源
description: "更新Cent OS系统的epel源,跟新yum源."
modified: 2017-08-24 15:20:20
tags: [Linux,Cent OS,epel,yum]
post_type: developer
blogid: 201708240001
categories: [Cent OS]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. Cent OS 7 epel源安装

由于Centos 7与老版本有着巨大的差别，所以各种软件包都无法沿用老版本的，所以若使用老版本的扩展yum源，就会导致yum出现严重错误，无法安装大量软件包，不过epel源已经支持了Centos 7，只要添加即可

## 1.1 安装

运行命令编辑yum源：`vim /etc/yum.repos.d/epel.repo`

按i进入编辑模式，粘贴下面的代码：

```shell
[epel]
name=Extra Packages for Enterprise Linux 7 - $basearch
#baseurl=http://download.fedoraproject.org/pub/epel/7/$basearch
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-7&arch=$basearch
failovermethod=priority
enabled=1
gpgcheck=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7

[epel-debuginfo]
name=Extra Packages for Enterprise Linux 7 - $basearch - Debug
#baseurl=http://download.fedoraproject.org/pub/epel/7/$basearch/debug
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-debug-7&arch=$basearch
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=1

[epel-source]
name=Extra Packages for Enterprise Linux 7 - $basearch - Source
#baseurl=http://download.fedoraproject.org/pub/epel/7/SRPMS
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-source-7&arch=$basearch
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=1
```

`:wq`保存退出

运行命令即可：`yum makecache`

或直接使用`yum install epel-release -y`安装epel源。

如果使用`yum install epel-release -y`还是无法更新 yum 源的话有可能是源的禁用掉了

编辑文件`vim /etc/yum.repos.d/epel.repo`，将第一个和第三个中的`enabled`改为`1`

```shell
[epel]
name=Extra Packages for Enterprise Linux 7 - $basearch
#baseurl=http://download.fedoraproject.org/pub/epel/7/$basearch
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-7&arch=$basearch
failovermethod=priority
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7

[epel-debuginfo]
name=Extra Packages for Enterprise Linux 7 - $basearch - Debug
#baseurl=http://download.fedoraproject.org/pub/epel/7/$basearch/debug
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-debug-7&arch=$basearch
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=1

[epel-source]
name=Extra Packages for Enterprise Linux 7 - $basearch - Source
#baseurl=http://download.fedoraproject.org/pub/epel/7/SRPMS
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-source-7&arch=$basearch
failovermethod=priority
enabled=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=1
```

## 2. Cent OS 6.x epel源安装

直接使用`yum install epel-release -y`安装epel源即可。
