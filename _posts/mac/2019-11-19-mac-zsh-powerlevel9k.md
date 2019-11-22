---
layout: post
title:  Mac下终端改造方案之 Powerlevel9K 主题
description: "Powerlevel9k 是使用电力线字体的ZSH的主题。 它可以与 vanilla 或者 ZSH 框架( 如 Oh-My-Zsh。Prezto。抗原插件和) 一起使用。从终端中获取更多信息。"
modified: 2019-11-19 13:20:20
tags: [Mac,Iterm2,zsh,Terminal,oh-my-zsh,Powerlevel9K]
post_type: developer
blogid: 201711190001
categories: [Mac ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. 概述

[Powerlevel9k][1] 是使用[电力线字体的ZSH的主题](https://github.com/powerline/fonts)。 它可以与 vanilla 或者 ZSH 框架( 如 Oh-My-Zsh。Prezto。抗原插件和) 一起使用。

从终端中获取更多信息。


### 1.1 安装 Powerlevel9K

``` bash
git clone https://github.com/bhilburn/powerlevel9k.git ~/.oh-my-zsh/custom/themes/powerlevel9k
```

### 1.2 安装字体

```bash
brew tap homebrew/cask-fonts
brew cask install font-hack-nerd-font
```

### 1.3 下载配色方案

```
git clone https://github.com/mbadolato/iTerm2-Color-Schemes
```

配置配置方案

![Alt text]({{site.url}}/images/posts_image/iterm2_import_2019_11_22_002.jpg)

配色方案可以根据自己的喜好进行更改


### 1.4 设置 iTerm2

![Alt text]({{site.url}}/images/posts_image/iterm2_powerlevel9k_2019_11_22_001.jpg)

### 1.5 编辑配置文件

编辑配置文件 `vim ~/.zshrc`


```bash
# -------------------------------- POWERLEVEL ---------------------------------

ZSH_THEME="powerlevel9k/powerlevel9k"

# 调整字体
POWERLEVEL9K_MODE='nerdfont-complete' 

# 始终显示用户名，但对主机名进行条件设置。
POWERLEVEL9K_ALWAYS_SHOW_USER=true

# 下面这个变量表示最左侧的提示符所显示的内容，默认是 `%n@%m`，也就是你的用户名以及终端名称。 
POWERLEVEL9K_CONTEXT_TEMPLATE="%n@%m"
# 下面这个变量表示右侧提示符显示内容
# 此处的设置依次是，上一命令执行时间、上一命令执行状态、后台任务个数、时间
POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(command_execution_time status background_jobs time)
# 下面这个变量表示 低于这个值的命令执行时间不显示，0 也就是命令执行时间多长都显示
POWERLEVEL9K_COMMAND_EXECUTION_TIME_THRESHOLD="0"
# 段列表为左提示符
POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(os_icon user dir vcs)
# command 执行时间颜色设置
POWERLEVEL9K_COMMAND_EXECUTION_TIME_BACKGROUND=black
POWERLEVEL9K_COMMAND_EXECUTION_TIME_FOREGROUND=blue
# VCS（ Git仓库状态的色彩） 颜色设置
POWERLEVEL9K_VCS_CLEAN_FOREGROUND=black
POWERLEVEL9K_VCS_CLEAN_BACKGROUND=green
POWERLEVEL9K_VCS_UNTRACKED_FOREGROUND=black
POWERLEVEL9K_VCS_UNTRACKED_BACKGROUND=yellow
POWERLEVEL9K_VCS_MODIFIED_FOREGROUND=white
POWERLEVEL9K_VCS_MODIFIED_BACKGROUND=black
# VCS 图标显示
# POWERLEVEL9K_VCS_UNTRACKED_ICON=●
# POWERLEVEL9K_VCS_UNSTAGED_ICON=±
# POWERLEVEL9K_VCS_INCOMING_CHANGES_ICON=↓
# POWERLEVEL9K_VCS_OUTGOING_CHANGES_ICON=↑
# POWERLEVEL9K_VCS_COMMIT_ICON=' '

POWERLEVEL9K_STATUS_OK_IN_NON_VERBOSE=true
POWERLEVEL9K_STATUS_VERBOSE=false

# 时间格式
POWERLEVEL9K_TIME_BACKGROUND=black
POWERLEVEL9K_TIME_FOREGROUND=white
POWERLEVEL9K_TIME_FORMAT=%D{ %I:%M}

# 自定义系统图标及颜色
# POWERLEVEL9K_CUSTOM_OS_ICON='echo   $(whoami) '
# POWERLEVEL9K_CUSTOM_OS_ICON_BACKGROUND=red
# POWERLEVEL9K_CUSTOM_OS_ICON_FOREGROUND=white
```

刷新配置文件 `source ~/.zshrc`


### 1.6 VS Code 配置

配置完之后，VS Code 无法正常显示字体，在 VS Code 配置中添加如下

```json
{
    "terminal.integrated.fontFamily": "Hack Nerd Font",
    "terminal.integrated.fontSize": 14,
    "editor.fontFamily": "Hack Nerd Font"
}
```



##### 参考资料

- [powerlevel9k][1]
- [nerd-fonts][2]
- [iTerm2 配色方案](https://github.com/mbadolato/iTerm2-Color-Schemes)
- [参考配色方案](https://github.com/daniruiz/dotfiles)

[1]:https://github.com/Powerlevel9k/powerlevel9k
[2]:https://github.com/ryanoasis/nerd-fonts


