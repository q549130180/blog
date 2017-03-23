---
layout: post
title:  Nginx 配置 location 总结及 rewrite 规则
description: "Nginx是一款轻量级的Web 服务器/反向代理服务器及电子邮件（IMAP/POP3）代理服务器，并在一个BSD-like 协议下发行。由俄罗斯的程序设计师Igor Sysoev所开发，供俄国大型的入口网站及搜索引擎Rambler（俄文：Рамблер）使用。其特点是占有内存少，并发能力强，事实上nginx的并发能力确实在同类型的网页服务器中表现较好，中国大陆使用nginx网站用户有：京东、新浪、网易、腾讯、淘宝等。<br>本文将详细的讲解Nginx服务器的安装与配置文件的说明。"
modified: 2017-03-22 13:20:20
tags: [Nginx,http Server,location,rewrite]
post_type: developer
series: Nginx系列文章
blogid: 201703220001
categories: [Nginx ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. location 配置与正则写法

语法规则： `location [=|~|~*|^~] /uri/ { … }`

- `=` 开头表示精确匹配
- `^~` 开头表示uri以某个常规字符串开头，理解为匹配 url路径即可。nginx不对url做编码，因此请求为/static/20%/aa，可以被规则^~ /static/ /aa匹配到（注意是空格）。
- `~` 开头表示区分大小写的正则匹配
- `~*`  开头表示不区分大小写的正则匹配
- `!~` 和 `!~*` 分别为区分大小写不匹配及不区分大小写不匹配 的正则
- `/` 通用匹配，任何请求都会匹配到。



顺序 or 优先级 : `location =` > `location 完整路径` > `location ^~ 路径` > `location ~,~* 正则顺序` > `location 部分起始路径` > `/`

示例：

```nginx
location = / {
   #规则A
}
location = /login {
   #规则B
}
location ^~ /static/ {
   #规则C
}
location ~ \.(gif|jpg|png|js|css)$ {
   #规则D
}
location ~* \.png$ {
   #规则E
}
location !~ \.xhtml$ {
   #规则F
}
location !~* \.xhtml$ {
   #规则G
}
location / {
   #规则H
}

```

那么产生的效果如下：

- 访问根目录/， 比如http://localhost/ 将匹配规则A
- 访问 http://localhost/login 将匹配规则B，http://localhost/register 则匹配规则H
- 访问 http://localhost/static/a.html 将匹配规则C
- 访问 http://localhost/a.gif, http://localhost/b.jpg 将匹配规则D和规则E，但是规则D顺序优先，规则E不起作用，而 http://localhost/static/c.png 则优先匹配到 规则C
- 访问 http://localhost/a.PNG 则匹配规则E， 而不会匹配规则D，因为规则E不区分大小写。
- 访问 http://localhost/a.xhtml 不会匹配规则F和规则G，http://localhost/a.XHTML不会匹配规则G，因为不区分大小写。规则F，规则G属于排除法，符合匹配规则但是不会匹配到，所以想想看实际应用中哪里会用到。
- 访问 http://localhost/category/id/1111 则最终匹配到规则H，因为以上规则都不匹配，这个时候应该是nginx转发请求给后端应用服务器，比如FastCGI（php），tomcat（jsp），nginx作为方向代理服务器存在。


所以实际使用中，个人觉得至少有三个匹配规则定义，如下：

```nginx
#直接匹配网站根，通过域名访问网站首页比较频繁，使用这个会加速处理，官网如是说。
#这里是直接转发给后端应用服务器了，也可以是一个静态首页
# 第一个必选规则
location = / {
    proxy_pass http://tomcat:8080/index
}

# 第二个必选规则是处理静态文件请求，这是nginx作为http服务器的强项
# 有两种配置模式，目录匹配或后缀匹配,任选其一或搭配使用
location ^~ /static/ {
    root /webroot/static/;
}

location ~* \.(gif|jpg|jpeg|png|css|js|ico)$ {
    root /webroot/res/;
}

#第三个规则就是通用规则，用来转发动态请求到后端应用服务器
#非静态文件请求就默认是动态请求，自己根据实际把握
#毕竟目前的一些框架的流行，带.php,.jsp后缀的情况很少了
location / {
    proxy_pass http://tomcat:8080/
}

```

## 2. Rewrite规则

`rewrite`功能就是，使用nginx提供的全局变量或自己设置的变量，结合正则表达式和标志位实现url重写以及重定向。`rewrite`只能放在`server{}`,`location{}`,`if{}`中，并且只能对域名后边的除去传递的参数外的字符串起作用，例如 `http://seanlook.com/a/we/index.php?id=1&u=str` 只对`/a/we/index.php`重写。语法`rewrite regex replacement [flag]`;

如果相对域名或参数字符串起作用，可以使用全局变量匹配，也可以使用`proxy_pass`反向代理。

表明看`rewrite`和`location`功能有点像，都能实现跳转，主要区别在于`rewrite`是在同一域名内更改获取资源的路径，而`location`是对一类路径做控制访问或反向代理，可以`proxy_pass`到其他机器。很多情况下`rewrite`也会写在`location`里，它们的执行顺序是：

1. 执行`server`块的`rewrite`指令
2. 执行`location`匹配
3. 执行选定的`location`中的`rewrite`指令

如果其中某步URI被重写，则重新循环执行1-3，直到找到真实存在的文件；循环超过10次，则返回500 Internal Server Error错误。

### 2.1 flag标志位

- `last` : 相当于Apache的[L]标记，表示完成rewrite
- `break` : 停止执行当前虚拟主机的后续rewrite指令集
- `redirect` : 返回302临时重定向，地址栏会显示跳转后的地址
- `permanent` : 返回301永久重定向，地址栏会显示跳转后的地址

因为301和302不能简单的只返回状态码，还必须有重定向的URL，这就是return指令无法返回301,302的原因了。这里 last 和 break 区别有点难以理解：

1. `last`一般写在server和if中，而break一般使用在location中
2. `last`不终止重写后的url匹配，即新的url会再从server走一遍匹配流程，而break终止重写后的匹配
3. `break`和`last`都能组织继续执行后面的`rewrite`指令


### 2.2 if指令与全局变量

`if`判断指令
语法为`if(condition){...}`，对给定的条件condition进行判断。如果为真，大括号内的`rewrite`指令将被执行，if条件(conditon)可以是如下任何内容：

- 当表达式只是一个变量时，如果值为空或任何以0开头的字符串都会当做false
- 直接比较变量和内容时，使用`=`或`!=`
- `~`正则表达式匹配，`~*`不区分大小写的匹配，`!~`区分大小写的不匹配

`-f`和`!-f`用来判断是否存在文件<br />
`-d`和`!-d`用来判断是否存在目录<br />
`-e`和`!-e`用来判断是否存在文件或目录<br />
`-x`和`!-x`用来判断文件是否可执行<br />

例如：

```nginx
if ($http_user_agent ~ MSIE) {
    rewrite ^(.*)$ /msie/$1 break;
} //如果UA包含"MSIE"，rewrite请求到/msid/目录下
if ($http_cookie ~* "id=([^;]+)(?:;|$)") {
    set $id $1;
 } //如果cookie匹配正则，设置变量$id等于正则引用部分
if ($request_method = POST) {
    return 405;
} //如果提交方法为POST，则返回状态405（Method not allowed）。return不能返回301,302
if ($slow) {
    limit_rate 10k;
} //限速，$slow可以通过 set 指令设置
if (!-f $request_filename){
    break;
    proxy_pass  http://127.0.0.1;
} //如果请求的文件名不存在，则反向代理到localhost 。这里的break也是停止rewrite检查
if ($args ~ post=140){
    rewrite ^ http://example.com/ permanent;
} //如果query string中包含"post=140"，永久重定向到example.com
location ~* \.(gif|jpg|png|swf|flv)$ {
    valid_referers none blocked www.jefflei.com www.leizhenfang.com;
    if ($invalid_referer) {
        return 404;
    } //防盗链
}
```

全局变量

下面是可以用作if判断的全局变量

- `$args` ： #这个变量等于请求行中的参数，同$query_string
- `$content_length` ： 请求头中的Content-length字段。
- `$content_type` ： 请求头中的Content-Type字段。
- `$document_root` ： 当前请求在root指令中指定的值。
- `$host` ： 请求主机头字段，否则为服务器名称。
- `$http_user_agent` ： 客户端agent信息
- `$http_cookie` ： 客户端cookie信息
- `$limit_rate` ： 这个变量可以限制连接速率。
- `$request_method` ： 客户端请求的动作，通常为GET或POST。
- `$remote_addr` ： 客户端的IP地址。
- `$remote_port` ： 客户端的端口。
- `$remote_user` ： 已经经过Auth Basic Module验证的用户名。
- `$request_filename` ： 当前请求的文件路径，由root或alias指令与URI请求生成。
- `$scheme` ： HTTP方法（如http，https）。
- `$server_protocol` ： 请求使用的协议，通常是HTTP/1.0或HTTP/1.1。
- `$server_addr` ： 服务器地址，在完成一次系统调用后可以确定这个值。
- `$server_name` ： 服务器名称。
- `$server_port` ： 请求到达服务器的端口号。
- `$request_uri` ： 包含请求参数的原始URI，不包含主机名，如：”/foo/bar.php?arg=baz”。
- `$uri` ： 不带请求参数的当前URI，$uri不包含主机名，如”/foo/bar.html”。
- `$document_uri` ： 与$uri相同。


例：http://localhost:88/test1/test2/test.php

```
$host：localhost
$server_port：88
$request_uri：http://localhost:88/test1/test2/test.php
$document_uri：/test1/test2/test.php
$document_root：/var/www/html
$request_filename：/var/www/html/test1/test2/test.php
```

### 2.3 rewrite_log指令

- 语法：`rewrite_log on|off`;
- 默认值：`rewrite_log off`;
- 作用域：`http`,`server`,`location`,`if`;
- 开启或关闭以`notice`级别打印`rewrite`处理日志到`error log`文件。

nginx打开`rewrite log`例子

```
rewrite_log on;
error_log logs/xxx.error.log notice;
```
1. 打开`rewrite on`
2. 把`error log`的级别调整到 `notice`

### 2.4 set指令

- 语法：`set variable value`;
- 默认值：`none`;
- 作用域：`server`,`location`,`if`;

定义一个变量并赋值，值可以是文本，变量或者文本变量混合体。

示例：`set $varname "hello world"`;

### 2.5 uninitialized_variable_warn指令

- 语法：`uninitialized_variable_warn on | off`;
- 默认值：`uninitialized_variable_warn on`;
- 作用域：`http`,`server`,`location`,`if`;

控制是否输出为初始化的变量到日志

### 2.6 return 指令

语法：`return code`
默认值：`none`
使用字段：`server`, `location`, `if`

停止处理并为客户端返回状态码。非标准的444状态码将关闭连接，不发送任何响应头。可以使用的状态码有：204，400，402-406，408，410, 411, 413, 416与500-504。如果状态码附带文字段落，该文本将被放置在响应主体。相反，如果状态码后面是一个URL，该URL将成为location头补值。没有状态码的URL将被视为一个302状态码。

示例：如果访问的URL以`.sh`或`.bash`结尾，则返回403状态码。

```nginx
location ~ .*.(sh|bash)?$
{
    return 403;
}
```


### 2.7 常用正则
- `.` ： 匹配除换行符以外的任意字符
- `?` ： 重复0次或1次
- `+` ： 重复1次或更多次
- `*` ： 重复0次或更多次
- `\d` ：匹配数字
- `^` ： 匹配字符串的开始
- `$` ： 匹配字符串的介绍
- `{n}` ： 重复n次
- `{n,}` ： 重复n次或更多次
- `[c]` ： 匹配单个字符c
- `[a-z]` ： 匹配a-z小写字母的任意一个

小括号`()`之间匹配的内容，可以在后面通过`$1`来引用，`$2`表示的是前面第二个`()`里的内容。正则里面容易让人困惑的是`\`转义特殊字符。


### 2.8 rewrite实例

例1：

```nginx
http {
    # 定义image日志格式
    log_format imagelog '[$time_local] ' $image_file ' ' $image_type ' ' $body_bytes_sent ' ' $status;
    # 开启重写日志
    rewrite_log on;
    server {
        root /home/www;
        location / {
                # 重写规则信息
                error_log logs/rewrite.log notice;
                # 注意这里要用‘’单引号引起来，避免{}
                rewrite '^/images/([a-z]{2})/([a-z0-9]{5})/(.*)\.(png|jpg|gif)$' /data?file=$3.$4;
                # 注意不能在上面这条规则后面加上“last”参数，否则下面的set指令不会执行
                set $image_file $3;
                set $image_type $4;
        }
        location /data {
                # 指定针对图片的日志格式，来分析图片类型和大小
                access_log logs/images.log mian;
                root /data/images;
                # 应用前面定义的变量。判断首先文件在不在，不在再判断目录在不在，如果还不在就跳转到最后一个url里
                try_files /$arg_file /image404.html;
        }
        location = /image404.html {
                # 图片不存在返回特定的信息
                return 404 "image not found\n";
        }
}

```

对形如/images/ef/uh7b3/test.png的请求，重写到/data?file=test.png，于是匹配到location /data，先看/data/images/test.png文件存不存在，如果存在则正常响应，如果不存在则重写tryfiles到新的image404 location，直接返回404状态码。

例2：

```nginx
rewrite ^/images/(.*)_(\d+)x(\d+)\.(png|jpg|gif)$ /resizer/$1.$4?width=$2&height=$3? last;
```

对形如/images/bla_500x400.jpg的文件请求，重写到/resizer/bla.jpg?width=500&height=400地址，并会继续尝试匹配location。
