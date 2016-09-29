---
layout: post
title:  Eclipse远程对Tomcat进行Debug
description: 使用eclipse对远程服务器上的Tomcat进行Debug."
modified: 2016-09-29 12:20:20
tags: [Linux,Tomcat]
post_type: developer
categories: [Tomcat]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---



## 一、Tomcat环境配置

windows环境：

catalina.bat文件添加如下

```shell
CATALINA_OPTS="-Xdebug  -Xrunjdwp:transport=dt_socket,address=8000,server=y,suspend=n"
```

Linux环境：

catalina.sh文件添加如下

```shell
CATALINA_OPTS="-Xdebug  -Xrunjdwp:transport=dt_socket,address=8000,server=y,suspend=n"
```

参数说明：

- `-Xdebug`                       ： 启用调试模式
- `-Xrunjdwp<sub-options>`        : 加载JVM的JPDA参考实现库
- `transport=dt_socket`           ：Socket连接，可选dt_shmem 通过共享内存的方式连接到调试服务器
- `address=8000`                  ：调试服务器监听的端口
- `server=y`                      ： 是否是服务器端，n为客户端
- `suspend=n`                     ： 启动过程是否加载暂停，y为启动时暂停，方便调试启动过程

## 二、Eclipse配置

在Eclipse中，点击菜单项`run`->`debug confiurations`，双击`Remote Java Application`

配置如下：
![Alt text]({{site.url}}/images/posts_image/tomcat-debug-2016-09-29_104320.jpg)
配置完成后点击Debug
![Alt text]({{site.url}}/images/posts_image/tomcat-debug-2016-09-29_105119.jpg)


然后将项目的war包拷贝到Tomcat的webapps目录下并启动Tomcat,然后在eclipse中打一个断点，打开浏览器点击相应页面进入断点。
![Alt text]({{site.url}}/images/posts_image/tomcat-debug-2016-09-29_104902.jpg)

断开debug连接
![Alt text]({{site.url}}/images/posts_image/tomcat-debug-2016-09-29_105155.jpg)

重新连接
![Alt text]({{site.url}}/images/posts_image/tomcat-debug-2016-09-29_105421.jpg)
