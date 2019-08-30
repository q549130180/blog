---
layout: post
title:  Cent OS 添加删除交换分区(Swap)
description: "在使用VPS时，自带的内存只有1G，默认的镜像没有swap，在很多时候会出现内存不够用的情况，升级配置又不太值得，所以就可以手动添加一块Swap."
modified: 2018-05-24 15:20:20
tags: [Linux,Cent OS,Swap]
post_type: developer
blogid: 201805240001
categories: [Cent OS]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 概述

### 1.1 背景

在使用VPS时，自带的内存只有1G，默认的镜像没有swap，在很多时候会出现内存不够用的情况，升级配置又不太值得，所以就可以手动添加一块Swap

### 1.2 环境

- Cent OS 7.3

## 2. 添加交换分区

### 2.1 `dd` 命令 创建swap用的分区文件

```bash
dd if=/dev/zero of=/swapfile bs=1024k count=2048
```

- `of` 分区文件位置
- `bs` 每个块的大小
- `count` 块的数量

等待一会，显示如下

```bash
2048+0 records in
2048+0 records out
2147483648 bytes (2.1 GB) copied, 8.09592 s, 265 MB/s
```

##### 注：dd创建的文件总大小等于`bs*count`。本例是`1024k*2048=2048M`。

### 2.2 使用 `mkswap` 命令来设置交换文件

```bash
mkswap /swapfile
```

### 2.3 启用交换分区

```bash
swapon /swapfile
```

### 2.4 查看`free -h`

```bash
              total        used        free      shared  buff/cache   available
Mem:           992M        755M         60M         50M        176M         39M
Swap:          2.0G          0B        2.0G
```

### 2.5 编辑文件`vim /etc/fstab`写入以下内容,以便在引导时启用

```bash
/swapfile swap swap defaults 0 0
```

## 3. 删除交换分区文件

### 3.1 禁用交换分区

```bash
swapoff /swapfile
```

### 3.2 从 `/etc/fstab` 中删除项目


### 3.3 删除分区文件

```
rm -rf /swapfile
```
