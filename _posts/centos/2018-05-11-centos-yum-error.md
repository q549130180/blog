---
layout: post
title:  记一次 yum update 包错误
description: "有时，yum包管理器可能会遇到错误地安装在系统上的重复包的问题，这些会体现在 yum update 上,错误信息：--> Finished Dependency Resolution Error: Package: ntp-4.2.6p5-25.el7.centos.2.x86_64 (@updates)"
modified: 2018-05-11 17:20:20
tags: [Linux,Cent OS]
post_type: developer
blogid: 201805110001
categories: [Cent OS]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---



## 1. 问题描述

有时，yum包管理器可能会遇到错误地安装在系统上的重复包的问题，这些会体现在`yum update`上，错误信息如下：

```bash
--> Finished Dependency Resolution
Error: Package: ntp-4.2.6p5-25.el7.centos.2.x86_64 (@updates)
           Requires: ntpdate = 4.2.6p5-25.el7.centos.2
           Removing: ntpdate-4.2.6p5-25.el7.centos.2.x86_64 (@updates)
               ntpdate = 4.2.6p5-25.el7.centos.2
           Updated By: ntpdate-4.2.6p5-28.el7.centos.x86_64 (base)
               ntpdate = 4.2.6p5-28.el7.centos
Error: Package: glibc-devel-2.17-196.el7_4.2.x86_64 (@updates)
           Requires: glibc-headers = 2.17-196.el7_4.2
           Removing: glibc-headers-2.17-196.el7_4.2.x86_64 (@updates)
               glibc-headers = 2.17-196.el7_4.2
           Updated By: glibc-headers-2.17-222.el7.x86_64 (base)
               glibc-headers = 2.17-222.el7
 You could try using --skip-broken to work around the problem
** Found 56 pre-existing rpmdb problem(s), 'yum check' output follows:
```

## 2. 解决

### 2.1 安装`yum-utils`

帮助我们解决这些问题的实用程序叫做`package-cleanup`，它是`yum-utils`包的一部分。让我们先安装，然后再继续:

```bash
yum install yum-utils
```

### 2.2 查看重复包

接下来，让我们看看我们的系统有什么问题。`package-cleanup –dupes`将显示系统上的重复包:

```bash
Loaded plugins: fastestmirror
parted-3.1-28.el7.x86_64
parted-3.1-29.el7.x86_64
tar-1.26-34.el7.x86_64
tar-1.26-32.el7.x86_64
lvm2-2.02.177-4.el7.x86_64
lvm2-2.02.171-8.el7.x86_64
wpa_supplicant-2.6-9.el7.x86_64
wpa_supplicant-2.6-5.el7_4.1.x86_64
iprutils-2.4.15.1-1.el7.x86_64
iprutils-2.4.14.1-1.el7.x86_64
kexec-tools-2.0.15-13.el7.x86_64
kexec-tools-2.0.14-17.2.el7.x86_64
rsyslog-8.24.0-12.el7.x86_64
rsyslog-8.24.0-16.el7.x86_64
tuned-2.8.0-5.el7_4.2.noarch
tuned-2.9.0-1.el7.noarch
glibc-devel-2.17-222.el7.x86_64

[省略若干...]

```

### 2.3 清理包

在这里，我们看到几个软件包似乎已经安装了不止一次。`–cleandupes`参数将对此进行处理，消除这些多余的包:

```bash
package-cleanup --cleandupes
```

这个过程看起来非常类似于`yum update`，有`yum`验证和擦除重复。对已删除的包进行记录并检查最新版本是否仍然安装，没有什么坏处。

### 2.4 跟新

接下来我们使用`yum update`来跟新系统，这应该会处理掉在前一个过程中可能已经被删除的任何依赖项，当然它也会更新系统的其他部分，希望能解决最初的问题。

### 2.5 检查

最后，为了查看`yum`数据库是否存在其他问题，我们可以发布以下内容，并希望得到相同的消息:

```bash
package-cleanup --problems
```

结果

```bash
Loaded plugins: fastestmirror
No Problems Found
```
