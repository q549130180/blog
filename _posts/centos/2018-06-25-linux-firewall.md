---
layout: post
title: Cent OS 7 防火墙 firewalld 的常用命令
description: "自从 CentOS 7 以后CnetOS的防火墙全部改为 firewall 了，这里我们来介绍下 firewall 的简单使用。"
modified: 2018-06-25 15:20:20
tags: [Linux,Cent OS,firewalld]
post_type: developer
blogid: 201806250001
categories: [Cent OS]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 概述

### 1.1 前言

自从 CentOS 7 以后CnetOS的防火墙全部改为 firewall 了，这里我们来介绍下 firewall 的简单使用

### 1.2 环境

- Cnet OS 7.3

## 2. 运行、停止、禁用firewalld

- 启动 : `systemctl start firewalld`
- 查看状态 : `systemctl status firewalld`
- 停止 : `systemctl stop firewalld`
- 禁用 : `systemctl disable firewalld`

## 3. firewalld 的使用

- 查看版本 : `firewall-cmd --version`
- 查看帮助 : `firewall-cmd --help`
- 查看所有打开的端口 : `firewall-cmd --zone=public --list-ports`
- 更新防火墙规则 : `firewall-cmd --reload`
- 查看区域信息 : `firewall-cmd --get-active-zones`
- 查看指定接口所属区域 : `firewall-cmd --get-zone-of-interface=eth0`
- 拒绝所有包 : `firewall-cmd --panic-on`
- 取消拒绝状态 : `firewall-cmd --panic-off`
- 查看是否拒绝 : `firewall-cmd --query-panic`

## 4. 开启端口

1. 添加`firewall-cmd --zone=public --add-port=80/tcp --permanent`（--permanent永久生效，没有此参数重启后失效）
2. 重新载入`firewall-cmd --reload`
3. 查看`firewall-cmd --zone=public --query-port=80/tcp`
4. 删除`firewall-cmd --zone=public --remove-port=80/tcp --permanent`
