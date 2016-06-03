
## 一、简介

Jenkins是一个开源软件项目，旨在提供一个开放易用的软件平台，使软件的持续集成变成可能。

功能：
1. 持续的软件版本发布/测试项目。
2.、监控外部调用执行的工作。

优点有：

- 开源，即免费。
- 支持多种平台（windows、linux、os x都支持）。
- 安装、配置简单。
- Web可视化管理界面，并且有丰富的tips帮助信息。


## 二、环境

- OS: Cent OS 7
- JDK: Java JDK 1.7


## 三、安装与配置


官网：http://jenkins-ci.org/

jenkins针对不同的环境有多个版本可以下载，本教程以war包进行讲解。

war包完整直接把war包放入到tomcat中，启动tomcat，访问：localhost:8080/jenkins/

```
nohup java -jar jenkins.war > jenkins.log 2>&1 &
```

访问：http://localhost:8080

**注:** jenkins.log为日志文件，可自行指定目录。

参数说明：
- --httpPort = $ HTTP_PORT运行在使用标准端口$ HTTP_PORTjenkins监听HTTP协议。默认端口号为8080。要禁用（因为你使用的是HTTPS），使用端口-1。
- --httpListenAddress = $ HTTP_HOST结合jenkins由$ HTTP_HOST代表的IP地址。默认值是0.0.0.0 -即侦听所有可用的接口。例如，只监听本地请求，你可以使用：--httpListenAddress = 127.0.0.1
- --httpsPort = $ HTTP_PORT使用HTTPS协议的端口$ HTTP_PORT
- --httpsListenAddress = $ HTTPS_HOST结合jenkins监听由$ HTTPS_HOST表示IP地址的HTTPS请求。
- --prefix = $ PREFIX 运行jenkins包括$ PREFIX在URL的末尾。例如，为了使jenkins在访问的http ：// MYSERVER：8080 /jenkins，设置--prefix = /jenkins
- --ajp13Port = $ AJP_PORT运行在使用标准端口$ AJP_PORTjenkins监听AJP13协议。默认端口号为8009。要禁用（因为你使用的是HTTPS），使用端口-1。
- --ajp13ListenAddress = $ AJP_HOST结合jenkins由$ AJP_HOST代表的IP地址。默认值是0.0.0.0 - 即监听所有可用的接口。
- --argumentsRealm.passwd $ ADMIN_USER设置用户的密码$ ADMIN_USER。如果jenkins的安全性已打开，你必须为了配置jenkins或jenkins项目为$ ADMIN_USER登录。

注意：您还必须指定该用户具有管理员的角色。（见下参数）。
- --argumentsRealm.roles $ ADMIN_USER =管理设置了$ ADMIN_USER是管理员用户，可以配置jenkins如果jenkins的安全性已开启。见确保詹金斯以获取更多信息。
- -Xdebug -Xrunjdwp：运输= dt_socket，地址= $ DEBUG_PORT，服务器= Y，暂停= N台调试中，您可以访问调试上$ DEBUG_PORT。
- - 日志文件= $ LOG_PATH / winstone_`date +"%Y%M-%D_%H-%M"`.log文件登录到所需的文件
- -XX：PermSize = 512M -XX：MaxPermSize = 2048M -Xmn128M -Xms1024m -Xmx2048M


1.初始密码可以根据提示进入到相应的目录进行查找

2.选择要安装的插件

3.继续安装完成


## 四、系统配置


### 1.maven配置

系统管理>

maven插件
Maven Integration plugin

### 2.服务器配置

安装SSH插件:
进入->系统管理>管理插件，搜索Publish Over SSH进行安装


SSH Server配置
系统管理>系统设置>SSH Servers>增加

![Alt text]({{site.url}}/images/posts_image/jenkins_2016_06_03_152023.jpg)

参数配置结束，点击Test Configuration，会提示Success，则表示连接成功。

然后点击保存。

### 2.创建项目


新建>填写项目名称，点击构建一个maven项目

svn拉去源码地址



构建触发器
