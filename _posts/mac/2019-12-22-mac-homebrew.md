---
layout: post
title:  HomeBrew 安装及常用命令
description: "HomeBrew 是 Mac OSX 上的软件包管理工具，能在 Mac 中方便的安装软件或者卸载软件， 使用命令，非常方便。"
modified: 2019-12-22 18:20:20
tags: [Mac,HomeBrew,Brew]
post_type: developer
categories: [HomeBrew ]
image:
  feature: posts_header/abstract-2.jpg
  credit:
  creditlink:
---


## 1. 概述

### 1.1 简介

HomeBrew 是 Mac OSX 上的软件包管理工具，能在 Mac 中方便的安装软件或者卸载软件， 使用命令，非常方便。

## 2. 安装

### 2.1 安装 `brew`

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

具体可参考 [HomeBrew][1] 官网。

### 2.2 安装`brew-cask`

安装完 `brew` 时，`brew-cask` 已经安装好了，无需额外安装

## 3. 使用


### 3.1 `brew`常用命令

- `$brew install name` 安装源码
- `$brew info svn` 显示软件的各种信息（包括版本、源码地址、依赖等等）
- `$brew home name` 访问应用官网
- `$brew uninstall name` 卸载软件
- `$brew search name`  搜索brew 支持的软件（支持模糊搜索）
- `$brew list` 列出本机通过brew安装的所有软件
- `$brew info name` 查看软件包信息
- `$brew home name` 访问软件包官方站
- `$brew outdated` 查看已安装的哪些软件包需要更新
- `$brew update` brew自身更新
- `$brew upgrade name`       更新安装过的软件(如果不加软件名，就更新所有可以更新的软件)
- `$brew cleanup` 清除下载的缓存,如果你只是想看看有哪些应用可以清理，但暂时不需要处理它们,可以使用 `$brew cleanup -n`

(PS:详见`man brew`)


### 3.2 `brew cask`的常用命令

- `$brew cask search` 列出所有可以被安装的软件
- `$brew cask search name` 查找所有和 name相关的应用
- `$brew cask install name` 下载安装软件
- `$brew cask home name` 访问应用官网
- `$brew cask uninstall name` 卸载软件
- `$brew cask info app` 列出应用的信息
- `$brew cask list` 列出本机安装过的软件列表
- `$brew cask cleanup` 清除下载的缓存以及各种链接信息
- `$brew cask uninstall name && brew cask install name` 更新程序 

（目前homebrew-cask 并没有命令直接更新已安装的软件，软件更新主要是通过软件自身的完成更新）

(PS:详见 `man brew cask`)

## 4. Brew 加速

[Brew][1]默认的镜像源是 GitHub，而 GitHub 时不时会被墙，即使不被墙访问速度有时也慢的令人发指，导致 `brew` 命令也常常超时甚至失败。解决办法要么换源，要么给GitHub配上Socks5代理。对码农而言，我更推荐后一种，方法如下：

1. 打开 `vim ~/.gitconfig` 文件，如果不存在则新建

2. 在文件末尾添加如下配置并保存：

```
[http "https://github.com"]
  proxy = socks5://127.0.0.1:1086
[https "https://github.com"]
  proxy = socks5://127.0.0.1:1086
```

> 注：`socks5://127.0.0.1:1086`是Shadowsocks默认开启的Socks5代理地址。



##### 参考资料

- [Homebrew 官网][1]
- [Homebrew国内源设置与常用命令](https://segmentfault.com/a/1190000008274997)
- [借助 Homebrew Cask，教你快速下载安装 Mac App 新姿势](https://sspai.com/post/32857)


[1]:https://brew.sh/index_zh-cn.html