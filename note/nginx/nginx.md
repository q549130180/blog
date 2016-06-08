


## 一、环境

- OS: Cent OS 7


## 二、安装Nginx

安装依赖

```
yum -y install gcc gcc-c++ make libtool zlib zlib-devel openssl openssl-devel pcre pcre-devel
```


下载地址： http://nginx.org/en/download.html
下载 nginx-1.9.14.tar.gz 到相应目录下。


为了后续准备我们另外下载2个插件模块：[nginx_upstream_check_module-0.3.0.tar.gz](https://github.com/yaoweibin/nginx_upstream_check_module/releases) —— 检查后端服务器的状态，[nginx-goodies-nginx-sticky-module-ng-bd312d586752.tar.gz](https://bitbucket.org/nginx-goodies/nginx-sticky-module-ng/downloads)（建议在/usr/local/src下解压后将目录重命名为nginx-sticky-module-ng-1.2.5） —— 后端做负载均衡解决session sticky问题。


```
./configure --prefix=/usr/local/nginx-1.6 --with-pcre \
 --with-http_stub_status_module --with-http_ssl_module \
 --with-http_gzip_static_module --with-http_realip_module \
 --add-module=../nginx-sticky-module-ng-1.2.5 --add-module=../nginx_upstream_check_module-0.3.0


make && make install
```

### 常用编译选项说明

nginx大部分常用模块，编译时./configure --help以--without开头的都默认安装。

- --prefix=PATH ： 指定nginx的安装目录。默认 /usr/local/nginx
- --conf-path=PATH ： 设置nginx.conf配置文件的路径。nginx允许使用不同的配置文件启动，通过命令行中的-c选项。默认为prefix/conf/nginx.conf
- --user=name： 设置nginx工作进程的用户。安装完成后，可以随时在nginx.conf配置文件更改user指令。默认的用户名是nobody。--group=name类似
- --with-pcre ： 设置PCRE库的源码路径，如果已通过yum方式安装，使用--with-pcre自动找到库文件。使用--with-pcre=PATH时，需要从PCRE网站下载pcre库的源码（版本4.4 - 8.30）并解压，剩下的就交给Nginx的./configure和make来完成。perl正则表达式使用在location指令和 ngx_http_rewrite_module模块中。
- --with-zlib=PATH ： 指定 zlib（版本1.1.3 - 1.2.5）的源码解压目录。在默认就启用的网络传输压缩模块ngx_http_gzip_module时需要使用zlib 。
- --with-http_ssl_module ： 使用https协议模块。默认情况下，该模块没有被构建。前提是openssl与openssl-devel已安装
- --with-http_stub_status_module ： 用来监控 Nginx 的当前状态
- --with-http_realip_module ： 通过这个模块允许我们改变客户端请求头中客户端IP地址值(例如X-Real-IP 或 X-Forwarded-For)，意义在于能够使得后台服务器记录原始客户端的IP地址
- --add-module=PATH ： 添加第三方外部模块，如nginx-sticky-module-ng或缓存模块。每次添加新的模块都要重新编译（Tengine可以在新加入module时无需重新编译）



### 启动关闭nginx

```
## 检查配置文件是否正确
# /usr/local/nginx-1.6/sbin/nginx -t
# ./sbin/nginx -V     # 可以看到编译选项

## 启动、关闭
# ./sbin/nginx        # 默认配置文件 conf/nginx.conf，-c 指定
# ./sbin/nginx -s stop
或 pkill nginx

## 重启，不会改变启动时指定的配置文件
# ./sbin/nginx -s reload
或 kill -HUP `cat /usr/local/nginx-1.6/logs/nginx.pid`
```


## 三、nginx.conf配置文件

**参考资料：**
https://segmentfault.com/a/1190000002797601
