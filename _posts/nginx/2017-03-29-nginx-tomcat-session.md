---
layout: post
title:  Nginx + Tomcat 导致 Session 丢失问题
description: 在使用Nginx代理tomcat时，使用rewrite进行重定向之后，导致session丢失问题."
modified: 2017-03-29 15:20:20
tags: [Nginx,Session,JSESSIONID]
post_type: developer
categories: [Nginx]
blogid: 201703290001
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---


因为这个问题跟生成cookie和session有着很大的关系，所以在解决问题之前我们先来了解几个概念，来帮助我们思考解决问题。

## 1. 基础概念

### 1.1 cookie与session的机制与原理      

cookie机制。正统的cookie分发是通过扩展HTTP协议来实现的，服务器通过在HTTP的响应头中加上一行特殊的指示以提示浏览器按照指示生成相应的cookie。然而纯粹的客户端脚本如JavaScript或者VBScript也可以生成cookie。而cookie的使用是由浏览器按照一定的原则在后台自动发送给服务器的。浏览器检查所有存储的cookie，如果某个cookie所声明的作用范围大于等于将要请求的资源所在的位置，则把该cookie附在请求资源的HTTP请求头上发送给服务器。

cookie的内容主要包括：名字，值，过期时间，路径和域。路径与域一起构成cookie的作用范围。若不设置过期时间，则表示这个cookie的生命期为浏览器会话期间，关闭浏览器窗口，cookie就消失。这种生命期为浏览器会话期的cookie被称为会话cookie。会话cookie一般不存储在硬盘上而是保存在内存里，当然这种行为并不是规范规定的。若设置了过期时间，浏览器就会把cookie保存到硬盘上，关闭后再次打开浏览器，这些cookie仍然有效直到超过设定的过期时间。存储在硬盘上的cookie可以在不同的浏览器进程间共享，比如两个IE窗口。而对于保存在内存里的cookie，不同的浏览器有不同的处理方式。

session机制。session机制是一种服务器端的机制，服务器使用一种类似于散列表的结构（也可能就是使用散列表）来保存信息。

当程序需要为某个客户端的请求创建一个session时，服务器首先检查这个客户端的请求里是否已包含了一个session标识------------称为session id，如果已包含则说明以前已经为此客户端创建过session，服务器就按照session id把这个session检索出来使用（检索不到，会新建一个），如果客户端请求不包含session id，则为此客户端创建一个session并且生成一个与此session相关联的session id，session id的值应该是一个既不会重复，又不容易被找到规律以仿造的字符串，这个session id将被在本次响应中返回给客户端保存。


保存这个session id的方式可以采用cookie，这样在交互过程中浏览器可以自动的按照规则把这个标识发挥给服务器。一般这个cookie的名字都是类似于SEEESIONID。但cookie可以被人为的禁止，则必须有其他机制以便在cookie被禁止时仍然能够把session id传递回服务器。


经常被使用的一种技术叫做URL重写，就是把session id直接附加在URL路径的后面。还有一种技术叫做表单隐藏字段。就是服务器会自动修改表单，添加一个隐藏字段，以便在表单提交时能够把session id传递回服务器。



### 1.2 JSESSIONID 简单说明

1) 第一次访问服务器的时候，会在响应头里面看到Set-Cookie信息（只有在首次访问服务器的时候才会在响应头中出现该信息）

![Alt text]({{site.url}}/images/posts_image/tomcat-session-jsessionid_2017_03_29_143333.jpg)


浏览器会根据响应头的set-cookie信息设置浏览器的cookie并保存之

注意此cookie由于没有设置cookie有效日期，所以在关闭浏览器的情况下会丢失掉这个cookie。

![Alt text]({{site.url}}/images/posts_image/tomcat-session-jsessionid_2017_03_29_143334.jpg)


2) 当再次请求的时候（非首次请求），浏览器会在请求头里将cookie发送给服务器(每次请求都是这样)

不难发现这个的JSESSIONID和上面的JSESSIONID是一样的


3) 为什么除了首次请求之外每次请求都会发送这个cookie呢（在这里确切地说是发送这个JSESSIONID）?

事实上当用户访问服务器的时候会为每一个用户开启一个session，浏览器是怎么判断这个session到底是属于哪个用户呢？JSESSIONID的作用就体现出来了：JSESSIONID就是用来判断当前用户对应于哪个session。换句话说服务器识别session的方法是通过jsessionid来告诉服务器该客户端的session在内存的什么地方。

Jsessionid只是tomcat的对sessionid的叫法，其实就是sessionid；在其它的容器也许就不叫JSESSIONID了。

事实上`JSESSIONID ==request.getSession().getId()`


## 2. 解决问题

### 2.1 原因

出现问题的配置，此配置会导致cookie存储的位置不是基于`/`那么在第二次访问的时候会从新创建session，因此session中的信息丢失。

```nginx
server {
	listen 80;
	server_name test.huangxubo.com;

	location = / {
			rewrite /(.*) /SmartEWeb/$1 last;
	}

	location /SmartEWeb {
			proxy_pass        http://192.168.0.100:8080;
			proxy_set_header  Host  $host;
			proxy_set_header  X-Real-IP  $remote_addr;
			proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
			client_max_body_size 300m;
	}

}
```

### 2.2 解决

由于tomcat是通过cookie中的JSESSIONID来判断是否是一个新用户的,我们上面讲到，当用户第一次请求时，JSESSIONID就会被创建，所以使用上述重定向代理的方式时，第一次访问的JSESSIONID会被写入到`/SmartEWeb`下，之后tomcat会将JSESSIONID写入到域名下的`/`路径下面。

用户再次访问 test.huangxubo.com 的时候，发送给服务器的请求拿不到/SmartEWeb路径下的JSESSIONID，因此tomcat会一直认为是一个新用户，这从/SmartEWeb 路径下的 JSESSIONID 会一直变化也可以看到。

上述分析表明，我们要让用户拿到它上次写入的JSESSIONID才可以，因为用户访问的域名是 test.huangxubo.com，这我们不能改变，因此应改变保存JSESSIONID的cookie的路径，将该路径变为 `/` 即可，这可通过nginx 的 `proxy_cookie_path` 来设置，将 tomcat 写入的 `/SmartEWeb` 路径下的cookie 变为 `/` 路径下，添加两行代码如下：

```nginx
server {
	listen 80;
	server_name test.huangxubo.com;

	location = / {
			rewrite /(.*) /SmartEWeb/$1 last;
	}

	location /SmartEWeb {
			proxy_pass        http://192.168.0.100:8080;
			proxy_set_header  Host  $host;
			proxy_set_header  X-Real-IP  $remote_addr;
			proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
			proxy_cookie_path /SmartEWeb /;
			proxy_set_header Cookie $http_cookie;
			client_max_body_size 300m;
	}
}
```
