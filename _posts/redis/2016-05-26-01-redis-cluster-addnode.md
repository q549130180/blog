---
layout: post
title:  Redis3.0.1集群动态增加或删除节点
description: "对Redis3.0.1集群进行动态的添加节点、删除节点等操作."
modified: 2016-05-26 15:20:20
tags: [Redis,Redis Cluster,Redis集群,linux]
post_type: developer
series: Redis系列文章
categories: [redis ]
image:
  feature: posts_header/abstract-2.jpg
  credit:
  creditlink:
---




## 1.首先把需要添加的节点启动

```bash
cd /usr/local/cluster/
mkdir 7007
cd 7007
mkdir conf data
cp /usr/local/cluster/7001/conf/redis.conf  /usr/local/cluster/7007/conf
cp -rf /usr/local/cluster/7007/ /usr/local/cluster
cd /usr/local/cluster/7007/conf
vim redis.conf
#修改redis.conf中的port和路径的参数的值为7007
#修改完7007之后再修改7008中的配置文件
redis-server /usr/local/cluster/7007/conf/redis.conf
redis-server /usr/local/cluster/7008/conf/redis.conf
```

## 2.执行以下命令，将这个新节点添加到集群中

```bash
cd /usr/local/cluster/redis-3.0.5/src
./redis-trib.rb add-node 127.0.0.1:7007 127.0.0.1:7001
```

第一个参数是我们刚才启动的新实例，第二个参数是集群中已有的节点。

![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-14_163603.jpg)

## 3.查看刚才新增的节点

执行命令`redis-cli -c -p 7001 cluster nodes`
![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-14_163827.jpg)

## 4.增加主节点

使用`redis-trib`程序，将集群中的某些哈希槽移动到新节点里面

执行`redis-cli -c -p 7001 cluster nodes`之后复制好新增节点的ID

执行下面的命令对集群中的哈希槽进行移动

```bash
cd /usr/local/cluster/redis-3.0.5/src
./redis-trib.rb reshard 127.0.0.1:7001
```

系统会提示我们要移动多少哈希槽，这里移动1000个
![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-14_164404.jpg)

然后还需要指定把这些哈希槽转移到哪个节点上，
![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-14_164543.jpg)

输入我们刚才新增的节点的ID:
1b85b140533946fe3e9a7700f22493171629e9ae

然后需要我们指定转移哪几个几点的哈希槽

![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-15_101753.jpg)

输入`all` 表示从所有的主节点中随机转移，凑够1000个哈希槽
然后再输入`yes`，redis集群就开始分配哈希槽了。
至此，一个新的主节点就添加完成了，执行命令查看现在的集群中节点的状态
`redis-cli -c -p 7001 cluster nodes`
![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-14_170215.jpg)

## 5.增加从节点

执行下面的命令，增加从节点：
`./redis-trib.rb add-node --slave 127.0.0.1:7008 127.0.0.1:7007`
第一个参数为从节点，第二个参数为主节点。

![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-14_170311.jpg)
使用下面命令来确认一下127.0.0.1:7008是否已经成为127.0.0.1:7007的从节点:
 `redis-cli -p 7001 cluster nodes | grep slave | grep 1b85b140533946fe3e9a7700f22493171629e9ae`参数ID为主节点ID

看到下面图片中的情况就表示添加成功,表示7007只有一个从节点7008
![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-14_170507.jpg)

## 6.删除主节点

如果删除的节点是主节点，这里我们删除127.0.0.1:7007节点，这个节点有1000个哈希槽
首先要把节点中的哈希槽转移到其他节点中，执行下面的命令

```bash
cd /usr/local/cluster/redis-3.0.5/src
./redis-trib.rb reshard 127.0.0.1:7001
```

- 系统会提示我们要移动多少哈希槽，这里移动1000个，因为127.0.0.1:7007节点有824个哈希槽
- 然后系统提示我们输入要接收这些哈希槽的节点的ID，这里使用127.0.0.1:7001的节点ID
- 然后要我们选择从那些节点中转出哈希槽，这里一定要输入127.0.0.1:7007这个节点的ID，最后输入`done`表示输入完毕
- 上面用到的数值和ID都可以从这段信息中找到。

![Alt text](http://image.lingfeng.me/images/content/redis_redis_img_2016-04-14_181803.jpg)
最后一步，使用下面的命令把这个节点删除

```bash
cd /usr/local/cluster/redis-3.0.5/src
./redis-trib.rb del-node 127.0.0.1:7001 127.0.0.1:7007
```

第一个参数是集群中的任何一个主节点地址，而第二个参数是要删除节点的 ID

## 7.删除从节点

如果节点是从节点的，直接使用下面的命令删除即可。

```bash
cd /usr/local/cluster/redis-3.0.5/src
./redis-trib.rb del-node 127.0.0.1:7001 127.0.0.1:7008
```
