---
layout: post
title:  Cnet OS 7 升级系统内核
description: "这里我们将介绍一下在 Cent OS 7 环境下来升级 Linux 内核。"
modified: 2019-03-18 14:20:20
tags: [Linux,Cent OS,kernel]
post_type: developer
blogid: 201903180001
categories: [Cent OS]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---

## 1. 环境

- Cnet OS 7.5
- kernel 3.10.0

## 2. 启用 ELRepo 仓库

```bash
sudo rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
sudo rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-3.el7.elrepo.noarch.rpm
```

## 3. 查看列表

使用命令 `yum --disablerepo=* --enablerepo=elrepo-kernel list kernel` 查看可安装列表，显示如下

```bash
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * elrepo-kernel: repos.lax-noc.com
Installed Packages
kernel.x86_64                                                                   3.10.0-862.9.1.el7                                                 @updates     
kernel.x86_64                                                                   3.10.0-862.11.6.el7                                                @updates     
kernel.x86_64                                                                   3.10.0-862.14.4.el7                                                @updates     
kernel.x86_64                                                                   3.10.0-957.1.3.el7                                                 @updates     
kernel.x86_64                                                                   3.10.0-957.5.1.el7                                                 @updates     
kernel-devel.x86_64                                                             3.10.0-957.5.1.el7                                                 @updates     
kernel-headers.x86_64                                                           3.10.0-957.5.1.el7                                                 @updates     
kernel-tools.x86_64                                                             3.10.0-957.5.1.el7                                                 @updates     
kernel-tools-libs.x86_64                                                        3.10.0-957.5.1.el7                                                 @updates     
Available Packages
kernel-lt.x86_64                                                                4.4.176-1.el7.elrepo                                               elrepo-kernel
kernel-lt-devel.x86_64                                                          4.4.176-1.el7.elrepo                                               elrepo-kernel
kernel-lt-doc.noarch                                                            4.4.176-1.el7.elrepo                                               elrepo-kernel
kernel-lt-headers.x86_64                                                        4.4.176-1.el7.elrepo                                               elrepo-kernel
kernel-lt-tools.x86_64                                                          4.4.176-1.el7.elrepo                                               elrepo-kernel
kernel-lt-tools-libs.x86_64                                                     4.4.176-1.el7.elrepo                                               elrepo-kernel
kernel-lt-tools-libs-devel.x86_64                                               4.4.176-1.el7.elrepo                                               elrepo-kernel
kernel-ml.x86_64                                                                5.0.2-1.el7.elrepo                                                 elrepo-kernel
kernel-ml-devel.x86_64                                                          5.0.2-1.el7.elrepo                                                 elrepo-kernel
kernel-ml-doc.noarch                                                            5.0.2-1.el7.elrepo                                                 elrepo-kernel
kernel-ml-headers.x86_64                                                        5.0.2-1.el7.elrepo                                                 elrepo-kernel
kernel-ml-tools.x86_64                                                          5.0.2-1.el7.elrepo                                                 elrepo-kernel
kernel-ml-tools-libs.x86_64                                                     5.0.2-1.el7.elrepo                                                 elrepo-kernel
kernel-ml-tools-libs-devel.x86_64                                               5.0.2-1.el7.elrepo                                                 elrepo-kernel
```

## 4. 安装最新版本的kernel

```bash
sudo yum --enablerepo=elrepo-kernel install kernel-ml-devel kernel-ml -y
```

`lt` 版本为长期维护版本，如果是正式环境可以安装

## 5. 查看系统上的所有内核

使用命令 `sudo awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg` 来进行查看

```bash
0 : CentOS Linux (5.0.2-1.el7.elrepo.x86_64) 7 (Core)
1 : CentOS Linux (3.10.0-957.5.1.el7.x86_64) 7 (Core)
2 : CentOS Linux (3.10.0-957.1.3.el7.x86_64) 7 (Core)
3 : CentOS Linux (3.10.0-862.14.4.el7.x86_64) 7 (Core)
4 : CentOS Linux (3.10.0-862.11.6.el7.x86_64) 7 (Core)
5 : CentOS Linux 7 Rescue 7cdbc0f765a5350e8224322d076c2103 (3.10.0-862.9.1.el7.x86_64)
6 : CentOS Linux (3.10.0-862.9.1.el7.x86_64) 7 (Core)
7 : CentOS Linux (0-rescue-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb) 7 (Core)
```

## 6. 设置 grub2

```bash
sudo grub2-set-default 0
```

生成 grub 配置文件

```bash
sudo grub2-mkconfig -o /boot/grub2/grub.cfg
```

## 7. 安装新版本工具包（可省略）

```bash
# 移除旧版本
sudo yum remove kernel-tools-libs.x86_64 kernel-tools.x86_64

# 安装新版本
sudo yum --disablerepo=* --enablerepo=elrepo-kernel install -y kernel-ml-tools.x86_64
```

## 8. 重启

```bash
sudo reboot
```

查看内核版本 `uname -sr`,输出如下

```bash
Linux 5.0.2-1.el7.elrepo.x86_64
```
