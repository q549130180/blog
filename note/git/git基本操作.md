



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
GIT_HOME=/usr/local/git  
PATH=$PATH:$GIT_HOME/bin:$GIT_HOME/libexec/git-core  
```

检查`git --version`,如果输出Git的版本号，则安装成功。

安装完成后，还需要最后一步设置，在命令行输入：
`$ git config --global user.name "Your Name"`
`$ git config --global user.email "email@example.com"`


因为Git是分布式版本控制系统，所以，每个机器都必须自报家门：你的名字和Email地址。你也许会担心，如果有人故意冒充别人怎么办？这个不必担心，首先我们相信大家都是善良无知的群众，其次，真的有冒充的也是有办法可查的。

注意`git config`命令的`--global`参数，用了这个参数，表示你这台机器上所有的Git仓库都会使用这个配置，当然也可以对某个仓库指定不同的用户名和Email地址。

## 三、git常用命令
