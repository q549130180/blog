---
layout: post
title:  树莓派安装Samba服务实现远程共享文件
description: "树莓派通过Samba服务来实现树莓派上的文件共享."
modified: 2017-12-26 15:20:20
tags: [Raspbian Pi,Raspberry Pi,Raspbian,Mac,树莓派,Samba]
post_type: developer
series: 树莓派系列文章
categories: [Raspbian Pi]
image:
  feature: posts_header/abstract-2.jpg
  credit:
  creditlink:
---

## 1. 安装Samba

使用`apt-get`来安装Samba:`sudo apt-get install samba samba-common-bin`

## 2. 配置

编辑Samba配置文件`sudo vim /etc/samba/smb.conf`,填入一下内容

```bash
[pi]
    path = /home/pi/
    valid users = pi#有效用户
    browseable = Yes
    writeable = Yes
    writelist = pi#可写用户列表
    create mask = 0777#新创建文件的默认属性
    directory mask = 0777#新创建文件夹的默认属性
```

其中 `Path` 是 Samba 的默认目录，也是根目录。设置为 `/home/pi` 后，用户可以访问 `/home/pi`.

添加 `pi`用户为 Samba 用户，设置密码时密码不会显示在窗口中。

`sudo smbpasswd -a pi` 添加 `pi` 用户为 Samba 用户，设置密码时密码不会显示在窗口中。

## 3. 启动

- 启动:`sudo systemctl start samba.service`
- 设置开机启动:`sudo systemctl enable samba.service`
- 关闭:`sudo systemctl stop samba.service`

## 4. Mac配置

![Alt text]({{site.url}}/images/posts_image/raspbian-samba-2017-12-26.jpg)

点击连接,输入用户名密码,就可以连接了.

## 5. Samba服务所使用的端口和协议 :

1. `Port 137 (UDP)` - NetBIOS 名字服务 ； nmbd
2. `Port 138 (UDP)` - NetBIOS 数据报服务
3. `Port 139 (TCP)` - 文件和打印共享 ； smbd （基于SMB(Server Message Block)协议，主要在局域网中使用，文件共享协议）
4. `Port 389 (TCP)` - 用于 LDAP (Active Directory Mode)
5. `Port 445 (TCP)` - NetBIOS服务在windos 2000及以后版本使用此端口, (Common Internet File System，CIFS，它是SMB协议扩展到Internet后，实现Internet文件共享)
6. `Port 901 (TCP)` - 用于 SWAT，用于网页管理Samba
我只映射了TCP139端口，即可通过外网使用IP访问到我的树莓派。
