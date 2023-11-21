---
layout: post
title:  Mac上更新Ruby
description: "在Mac上跟新Ruby的版本，以及Ruby版本的管理."
modified: 2017-08-25 15:20:20
tags: [Mac,Ruby,RVM]
post_type: developer
blogid: 201605110001
categories: [Mac ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 概述

RVM ：Ruby Version Manager,Ruby版本管理器，包括Ruby的版本管理和Gem库管理(gemset)。是一个命令行工具，它可以提供一个便捷的多版本 Ruby 环境的管理和切换。

https://rvm.io/

如果你打算学习 Ruby / Rails, RVM 是必不可少的工具之一。

## 2. 安装 RVM

运行命令：`curl -L get.rvm.io | bash -s stable`

等待一段时间后就可以成功安装好RVM。

刷新环境变量

```shell
source ~/.bashrc  
source ~/.bash_profile
```

测试是否安装正常:`rvm -v`

## 2. 用 RVM 升级 Ruby

查看当前ruby版本`ruby -v`  

```shell
ruby 2.3
```

列出已知的ruby版本:`rvm list known`

### 2.1 安装 Ruby

运行命令:`rvm install 2.3`

安装完成之后`ruby -v`查看是否安装成功。

## 3. 常用的rvm命令

列出已知的 Ruby 版本:`rvm list known`

安装一个 Ruby 版本:`rvm install 2.2.0 --disable-binary`

这里安装了最新的 2.4.0, rvm list known 列表里面的都可以拿来安装。

切换 Ruby 版本:`rvm use 2.2.0`

如果想设置为默认版本，这样一来以后新打开的控制台默认的 Ruby 就是这个版本:`rvm use 2.2.0 --default `

查询已经安装的Ruby:`rvm list`

卸载一个已安装版本:`rvm remove 1.8.7`

## 4. 安装过程中可能会出现的问题

### 4.1 问题一：安装Ruby版本时报以下错误

![Alt text](http://image.lingfeng.me/images/content/mac_ruby_2017-08-25_150455.png)

解决方法：卸载home-brew

```shell
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/uninstall)"
```

然后，在执行:`rvm install 2.3`

### 4.2 问题二：使用时报一下错误

![Alt text](http://image.lingfeng.me/images/content/mac_ruby_2017-08-25_1504565.png)

解决办法:

```shell
gem install cocoapods
gem install bundle
bundle update
```
