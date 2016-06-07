



## 一、git简介

Git是一款免费、开源的分布式版本控制系统，用于敏捷高效地处理任何或小或大的项目。


## 二、git安装与配置

git下载地址：https://www.kernel.org/pub/software/scm/git/

```
tar -xzf  git-2.1.3.tar.gz  
cd git-2.1.3  
./configure -prefix=/usr/local/git --with-curl  --with-expat  
make && make install  
```

添加环境变量：

```
export GIT_HOME=/usr/local/git  
export PATH=$PATH:$GIT_HOME/bin:$GIT_HOME/libexec/git-core  
```

检查`git --version`,如果输出Git的版本号，则安装成功。

安装完成后，还需要最后一步设置，在命令行输入：
`$ git config --global user.name "Your Name"`
`$ git config --global user.email "email@example.com"`


因为Git是分布式版本控制系统，所以，每个机器都必须自报家门：你的名字和Email地址。你也许会担心，如果有人故意冒充别人怎么办？这个不必担心，首先我们相信大家都是善良无知的群众，其次，真的有冒充的也是有办法可查的。

注意`git config`命令的`--global`参数，用了这个参数，表示你这台机器上所有的Git仓库都会使用这个配置，当然也可以对某个仓库指定不同的用户名和Email地址。

## 三、git常用命令

一般来说，日常使用只要记住下图6个命令，就可以了。但是熟练使用，恐怕要记住60～100个命令。

![Alt text]({{site.url}}/images/posts_image/git_git_2016_06-07.png)


Git 命令清单:

- Workspace：工作区
- Index / Stage：暂存区
- Repository：仓库区（或本地仓库）
- Remote：远程仓库


### 1.新建代码库

```
# 在当前目录新建一个Git代码库
$ git init

# 新建一个目录，将其初始化为Git代码库
$ git init [project-name]

# 下载一个项目和它的整个代码历史
$ git clone [url]
```


### 2.配置

Git的设置文件为.gitconfig，它可以在用户主目录下（全局配置），也可以在项目目录下（项目配置）。

```
# 显示当前的Git配置
$ git config --list

# 编辑Git配置文件
$ git config -e [--global]

# 设置提交代码时的用户信息
$ git config [--global] user.name "[name]"
$ git config [--global] user.email "[email address]"
```

### 3.增加/删除文件

```
# 添加指定文件到暂存区
$ git add [file1] [file2] ...

# 添加指定目录到暂存区，包括子目录
$ git add [dir]

# 添加当前目录的所有文件到暂存区
$ git add .

# 添加每个变化前，都会要求确认
# 对于同一个文件的多处变化，可以实现分次提交
$ git add -p

# 输入 y 来暂存该块
# 输入 n 不暂存
# 输入 e 手工编辑该块
# 输入 d 退出或者转到下一个文件
# 输入 s 来分割该块


# 删除工作区文件，并且将这次删除放入暂存区
$ git rm [file1] [file2] ...

# 停止追踪指定文件，但该文件会保留在工作区
$ git rm --cached [file]

# 改名文件，并且将这个改名放入暂存区
$ git mv [file-original] [file-renamed]
```

### 4.代码提交

```
# 提交暂存区到仓库区
$ git commit -m [message]

# 提交暂存区的指定文件到仓库区
$ git commit [file1] [file2] ... -m [message]

# 提交工作区自上次commit之后的变化，直接到仓库区
$ git commit -a

# 提交时显示所有diff信息
$ git commit -v

# 使用一次新的commit，替代上一次提交
# 如果代码没有任何新变化，则用来改写上一次commit的提交信息
$ git commit --amend -m [message]

# 重做上一次commit，并包括指定文件的新变化
$ git commit --amend [file1] [file2] ...
```




**参考资料：**

[10个迅速提升你Git水平的提示 ](http://www.oschina.net/translate/10-tips-git-next-level?cmp)
