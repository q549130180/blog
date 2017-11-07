---
layout: post
title:  Mac下终端改造方案
description: "使用iTerm2和oh-my-zsh折腾自己的Terminal。"
modified: 2017-11-07 13:20:20
tags: [Mac,Iterm2,zsh,Terminal]
post_type: developer
blogid: 201711070001
categories: [Mac ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1.概述

好久之前就想折腾一下自己的Terminal了，正好有点时间就把Terminal弄了下，折腾了一下午，终于把Terminal折腾成自己想要的效果了，先上个效果图
![Alt text]({{site.url}}/images/posts_image/mac_oh_my_zsh_2017-11-07_123456.jpg)


## 2. iTerm2 安装

下载iTerm2：http://www.iterm2.com/

安装iTerm2还是很简单的，直接下载安装即可。

查看Mac自带的终端 `cat /etc/shells`

输出如下：

```
# List of acceptable shells for chpass(1).
# Ftpd will not allow users to connect who are not using
# one of these shells.

/bin/bash
/bin/csh
/bin/ksh
/bin/sh
/bin/tcsh
/bin/zsh
```

说明Mac已经自带zsh了所以就不用再安装了。

查看默认终端 `echo $SHELL`

输出`/bin/bash`说明现在的终端是bash的

### 2.1 切换默认终端为zsh

执行命令`chsh -s /bin/zsh`将终端切换为zsh

如果想切换为默认终端，执行`chsh -s /bin/bash`,就可以再将终端切换为`bash`环境


### 2.2 安装配色方案

1. 下载地址：https://github.com/altercation/solarized

2. 进入刚刚下载的工程的`solarized/iterm2-colors-solarized` 下双击 `Solarized Dark.itermcolors` 和 `Solarized Light.itermcolors` 两个文件就可以把配置文件导入到 iTerm2 里

3. 配置配色方案
![Alt text]({{site.url}}/images/posts_image/mac_oh_my_zsh_2017-11-07_123457.jpg)


### 2.3 安装字体


1. 下载地址：https://github.com/powerline/fonts

2. 进入到项目目录，执行`./install.sh`指令安装所有Powerline字体

3. 配置字体
![Alt text]({{site.url}}/images/posts_image/mac_oh_my_zsh_2017-11-07_123457 3.jpg)

## 3. oh-my-zsh 安装

自动安装执行

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

手动安装

```shell
git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh
cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
```

### 3.1 使用agnoster主题

打开`.zshrc`文件，然后将`ZSH_THEME`后面的字段改为`agnoster`。`ZSH_THEME="agnoster"`（`agnoster`即为要设置的主题）
