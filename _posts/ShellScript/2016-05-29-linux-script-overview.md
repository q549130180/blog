---
layout: post
title:  Linux Shell Script概述
description: "shell脚本（shell script），是一种为shell编写的脚本程序。业界所说的shell通常都是指shell脚本，但读者朋友要知道，shell和shell script是两个不同的概念。由于习惯的原因，简洁起见，本文出现的“shell编程”都是指shell脚本编程，不是指开发shell自身（如Windows Explorer扩展开发）."
modified: 2016-05-29 13:20:20
tags: [Linux,Shell Script,shell]
post_type: developer
categories: [Shell Script ]
image:
  feature: posts_header/abstract-3.jpg
  credit:
  creditlink:
---


## 一、shell和shell脚本的概念

shell是指一种应用程序，这个应用程序提供了一个界面，用户通过这个界面访问操作系统内核的服务。Ken Thompson的sh是第一种Unix Shell，Windows Explorer是一个典型的图形界面Shell。

shell脚本（shell script），是一种为shell编写的脚本程序。业界所说的shell通常都是指shell脚本，但读者朋友要知道，shell和shell script是两个不同的概念。由于习惯的原因，简洁起见，本文出现的“shell编程”都是指shell脚本编程，不是指开发shell自身（如Windows Explorer扩展开发）。

当你在Linux中，打开Terminal的时候，出现了一个黑屏，又或一个白屏的窗口的，哦，这就是我们眼中的Shell，这种理解也许对，也许不对。

当我们打开Terminal的时候，其实运行了一个默认的Shell解释器，我们一般都是/bin/bash，当我们在终端中输入各种命令时，都是由这个/bin/bash来进行解释的；也就是说Shell是运行在Terminal上的一个程序。

明白了Shell以后，我们经常会在当前的Shell中运行一个Shell脚本，当你运行这个Shell脚本的时候，你是否知道这背后在干些什么么？这又说到下一个话题：父Shell与子Shell。

## 二、环境

shell编程跟java、php编程一样，只要有一个能编写代码的文本编辑器和一个能解释执行的脚本解释器就可以了。

### OS

当前主流的操作系统都支持shell编程，本文档所述的shell编程是指Linux下的shell，讲的基本都是POSIX标准下的功能，所以，也适用于Unix及BSD（如Mac OS）。

### Linux

Linux默认安装就带了shell解释器。

### Mac OS

Mac OS不仅带了sh、bash这两个最基础的解释器，还内置了ksh、csh、zsh等不常用的解释器。

### Windows上的模拟器

windows出厂时没有内置shell解释器，需要自行安装，为了同时能用grep, awk, curl等工具，最好装一个cygwin或者mingw来模拟linux环境。

cygwin
mingw

## 三、脚本解释器

### sh

即Bourne shell，POSIX（Portable Operating System Interface）标准的shell解释器，它的二进制文件路径通常是/bin/sh，由Bell Labs开发。

本文讲的是sh，如果你使用其它语言用作shell编程，请自行参考相应语言的文档。

### bash

Bash是Bourne shell的替代品，属GNU Project，二进制文件路径通常是/bin/bash。业界通常混用bash、sh、和shell，比如你会经常在招聘运维工程师的文案中见到：熟悉Linux Bash编程，精通Shell编程。

在CentOS里，/bin/sh是一个指向/bin/bash的符号链接:

```shell
[root@centosraw ~]# ls -l /bin/*sh
-rwxr-xr-x. 1 root root 903272 Feb 22 05:09 /bin/bash
-rwxr-xr-x. 1 root root 106216 Oct 17  2012 /bin/dash
lrwxrwxrwx. 1 root root      4 Mar 22 10:22 /bin/sh -> bash
```

但在Mac OS上不是，/bin/sh和/bin/bash是两个不同的文件，尽管它们的大小只相差100字节左右:

```shell
iMac:~ wuxiao$ ls -l /bin/*sh
-r-xr-xr-x  1 root  wheel  1371648  6 Nov 16:52 /bin/bash
-rwxr-xr-x  2 root  wheel   772992  6 Nov 16:52 /bin/csh
-r-xr-xr-x  1 root  wheel  2180736  6 Nov 16:52 /bin/ksh
-r-xr-xr-x  1 root  wheel  1371712  6 Nov 16:52 /bin/sh
-rwxr-xr-x  2 root  wheel   772992  6 Nov 16:52 /bin/tcsh
-rwxr-xr-x  1 root  wheel  1103984  6 Nov 16:52 /bin/zsh
```

## 四、高级编程语言

理论上讲，只要一门语言提供了解释器（而不仅是编译器），这门语言就可以胜任脚本编程，常见的解释型语言都是可以用作脚本编程的，如：Perl、Tcl、Python、PHP、Ruby。Perl是最老牌的脚本编程语言了，Python这些年也成了一些linux发行版的预置解释器。

编译型语言，只要有解释器，也可以用作脚本编程，如C shell是内置的（/bin/csh），Java有第三方解释器Jshell，Ada有收费的解释器AdaScript。

如下是一个PHP Shell Script示例（假设文件名叫test.php）：

```php
#!/usr/bin/php
<?php
for ($i=0; $i < 10; $i++)
        echo $i . "\n";
```
执行：
```shell
/usr/bin/php test.php
```
或者：
```shell
chmod +x test.php
./test.php
```
