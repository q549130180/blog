---
layout: post
title:  Cent OS 无法使用sudo命令
description: "如果你用的是Red Hat系列（包括Fedora和CentOS）的Linux系统。当你普通用户执行sudo命令时可能会提示“某某用户 is not in the sudoers file. This incident will be reported.”"
modified: 2018-05-03 15:20:20
tags: [Linux,Cent OS]
post_type: developer
blogid: 201805030002
categories: [Cent OS]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 概述

如果你用的是Red Hat系列（包括Fedora和CentOS）的Linux系统。当你普通用户执行sudo命令时可能会提示“某某用户 is not in the sudoers file.  This incident will be reported.”

## 2. 方法一

解决方法:编辑`sudoers`文件，使用root账户编辑文件:`vim /etc/sudoers`

假设你的用户名是`ling`,属于`linggroup`用户组

为了让用户`ling`能够执行`sudo`命，你可以在sudoers文件中加上一下四行的任意一行。

```shell
ling            ALL=(ALL)     ALL
%linggroup      ALL=(ALL)     ALL
ling            ALL=(ALL)     NOPASSWD:ALL
%linggroup      ALL=(ALL)     NOPASSWD:ALL
```

解释说明：

- 第一行：允许用户`ling`执行`sudo`命令（需要输入密码）。
- 第二行：允许用户组`linggroup`里面的用户执行`sudo`命令（需要输入密码）。
- 第三行：允许用户`ling`执行`sudo`命令，并且在执行的时候不输入密码。
- 第四行：允许用户组`linggroup`里面的用户执行`sudo`命令，并且在执行的时候不输入密码。

## 3. 方法二

将你的用户名添加到`wheel`组里面:`usermod -G wheel ling`，这样`ling`也就具有的`sudo`的权限。
