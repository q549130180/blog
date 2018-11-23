---
layout: post
title:  Linux mount共享远程目录（NFS）
description: "Linux共享目录就是通过网络让不同的服务器能够彼此分享各自的数据，让应用程序在客户端通过网络访问位于服务器磁盘中的数据。;"
modified: 2018-11-23 10:20:20
tags: [linux,mount,nfs]
post_type: developer
blogid: 201811230001
categories: [linux ]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. 概述

Linux共享目录就是通过网络让不同的服务器能够彼此分享各自的数据，让应用程序在客户端通过网络访问位于服务器磁盘中的数据。

下面我们使用两台服务器，分别演示服务端和客户端的安装与使用

主机 | IP | 备注
--- | --- | --- 
S1 | 192.168.1.100 | 服务端
S2 | 192.168.1.101 | 客户端

## 2. NFS服务器的安装 - 服务端安装

### 2.1 安装依赖

检查linux系统中是否安装了 `nfs-utils` 和 `rpcbind`（老版本的系统是安装portmap） 两个软件包

安装包 `yum -y install nfs-utils rpcbind`

### 2.2 开启服务（默认服务下nfs没有完全开启）

```
service rpcbind start
service nfs start
```

### 2.3 指定NFS服务器的配置文件

NFS 服务器的配置文件保存路径为 `/etc/exports`  ,该文件用于被指NFS服务器提供的目录共享


配置 `exports` 文件格式如下

```
/home *（rw,sync,no_root_squash） 
```

**参数说明 :**
- `home` : 共享目录名
- `*` : 表示所有主机
- `(sync,rw)` : 设置选项

`exports` 文件中的"配置选项"字段放置在一对括号中 ,多个选项间用逗号分隔

**配置选项说明 :**

- 访问权限选项
  - `sync` : 设置NFS服务器同步写磁盘,这样不会轻易丢失数据,建议所有的NFS共享目录都使用该选项
  - `ro` : 设置输出的共享目录只读,与rw不能共同使用
  - `rw` : 设置输出的共享目录可读写,与ro不能共同使用
- 用户映射选项
  - `all_squash` : 将远程访问的所有普通用户及所属组都映射为匿名用户或用户组（nfsnobody）；
  - `no_all_squash` : 与all_squash取反（默认设置）；
  - `root_squash` : 将root用户及所属组都映射为匿名用户或用户组（默认设置）;
  - `no_root_squash` : 与rootsquash取反；
  - `anonuid=xxx` : 将远程访问的所有用户都映射为匿名用户，并指定该用户为本地用户（UID=xxx）；
  - `anongid=xxx` : 将远程访问的所有用户组都映射为匿名用 户组账户，并指定该匿名用户组账户为本地用户组账户（GID=xxx）；
- 其它选项
  - `secure` : 限制客户端只能从小于1024的tcp/ip端口连接nfs服务器（默认设置）；
  - `insecure` : 允许客户端从大于1024的tcp/ip端口连接服务器；
  - `sync` : 将数据同步写入内存缓冲区与磁盘中，效率低，但可以保证数据的一致性；
  - `async` : 将数据先保存在内存缓冲区中，必要时才写入磁盘；
  - `wdelay` : 检查是否有相关的写操作，如果有则将这些写操作 一起执行，这样可以提高效率（默认设置）；
  - `no_wdelay` : 若有写操作则立即执行，应与sync配合使用；
  - `subtree` : 若输出目录是一个子目录，则nfs服务器将检查其父目录的权限(默认设置)；
  - `no_subtree` : 即使输出目录是一个子目录,nfs服务器也不检查其父目录的权限,这样可以提高效率;

**`exports` 文件中"客户端主机地址"字段可以使用多种形式表示主机地址**

- `192.168.152.13`　指定IP地址的主机
- `nfsclient.test.com`　指定域名的主机
- `192.168.1.0/24`　指定网段中的所有主机
- `*.test.com`　指定域下的所有主机
- `*`　所有主机

例 : `/test/fileServer * (rw,sync,no_root_squash)`

### 2.4 重启NFS服务器

```
service rpcbind restart
service nfs restart
```

### 2.5 查看NFS服务器是否启动

```
service nfs status
service rpcbind status
```

## 3. 客户端安装

### 3.1 安装依赖

```
yum -y install rpcbind
```

### 3.2 在客户端启动 rpcbind 服务

```
service rpcbind start
```    
    
### 3.3 在客户端 mount 远程文件夹

```
mount -t nfs 192.168.1.100:/test/fileServer /test/fileServer
```

### 3.4 查看目前客户端的挂载情况


执行命令 `mount | grep nfs`,输出结果如下

```
sunrpc on /var/lib/nfs/rpc_pipefs type rpc_pipefs (rw)
nfsd on /proc/fs/nfsd type nfsd (rw)
192.168.1.100:/test/fileServer on /test/fileServer type nfs (rw,addr=192.168.1.100)
```

### 3.5 去除客户端的挂载

`umount /test/fileServer` 或者 `umount -l /test/fileServer`

这里命令中加了 `-l` ，是强制执行的命令，对于出现 device is busy 时才可以使用


## 4. 开机自动挂载

按照上面的操作，客户端的目录挂载是临时的，服务器重启后就失效了，如果需要永久设置另外需要操作。

编辑配置文件 `vim /etc/fstab`,内容及说明如下

```
192.168.1.100:/test/fileServer /test/fileServer    nfs defaults    0   0
```

- 第一列可以是实际分区名，也可以是实际分区的卷标（Lable）。
  - 如果磁盘是SATA接口，且有多个磁盘，则每个磁盘被标记为 /dev/hda 、 /dev/hdb、 /dev/hdc 等以此类推；而每个磁盘的分区被标记为 /dev/hda1、 /dev/hda2等。
  - 如果磁盘是SCSI类型，则多个磁盘会被分别标记为 /dev/sda、/dev/sdb等等。分区同理。
  - 如果使用标签来表示，则格式如 : `LABLE=/`
- 第二列是挂载点。
  - 挂载点必须为当前已经存在的目录，为了兼容起见，最好在创建需要挂载的目标目录后，将其权限设置为777，以开放所有权限。
- 第三列为此分区的文件系统类型。
  - Linux可以使用ext2、ext3等类型，此字段须与分区格式化时使用的类型相同。也可以使用 auto 这一特殊的语法，使系统自动侦测目标分区的分区类型。auto通常用于可移动设备的挂载。
- 第四列是挂载的选项，用于设置挂载的参数。
  - 常见参数如下：
    - `auto` : 系统自动挂载，fstab默认就是这个选项
    - `defaults` : 没有特别需求一般都用这个
    - `defaults` : rw, suid, dev, exec, auto, nouser, and async.
    - `noauto` : 开机不自动挂载
    - `nouser` : 只有超级用户可以挂载
    - `ro` : 按只读权限挂载
    - `rw` : 按可读可写权限挂载
    - `user` : 任何用户都可以挂载
    - 请注意光驱和软驱只有在装有介质时才可以进行挂载，因此它是 `noauto`
- 第五列是 dump 备份设置。
  - 当其值设置为 1 时，将允许dump备份程序备份；设置为 0 时，忽略备份操作；
- 第六列是 fsck 磁盘检查设置。
  - 其值是一个顺序。当其值为 0 时，永远不检查；而 `/` 根目录分区永远都为 1。其它分区从 2 开始，数字越小越先检查，如果两个分区的数字相同，则同时检查。

当修改完此文件并保存后，重启服务器或打命令 `mount -a` 生效。

## 5. 问题汇总

### 问题一 

```
mount.nfs: access denied by server while mounting ... 
```

#### 1、使用了非法端口，也就是使用了大于1024的端口。

这个错误，可以通过查看日志确认 `cat /var/log/messages | grep mount`

```
Nov 22 16:51:45 TYMHYY rpc.mountd[7629]: Version 1.2.3 starting
Nov 22 17:07:07 TYMHYY rpc.mountd[7629]: Caught signal 15, un-registering and exiting.
Nov 22 17:07:08 TYMHYY rpc.mountd[8810]: Version 1.2.3 starting
Nov 22 17:13:43 TYMHYY rpc.mountd[8810]: Caught signal 15, un-registering and exiting.
Nov 22 17:13:44 TYMHYY rpc.mountd[9124]: Version 1.2.3 starting
Nov 22 17:18:22 TYMHYY rpc.mountd[9124]: Caught signal 15, un-registering and exiting.
Nov 22 17:18:22 TYMHYY rpc.mountd[9382]: Version 1.2.3 starting
```
 
**解决方案 ：**
修改配置文件`/etc/exports`，加入 `insecure` 选项,重启 nfs 服务，再尝试挂载。

```
`/test/fileServer　　* (insecure,rw,async,no_root_squash)`
``` 
#### 2、NFS版本问题

编辑 `/etc/sysconfig/nfs` 文件，找到下面:

```
#Turn off v2 and v3 protocol support 
#RPCNFSDARGS="-N 2 -N 3" 
#Turn off v4 protocol support 
#RPCNFSDARGS="-N 4"　　/*把这句前面的#号去掉*/
```

最后保存，重启 nfs 服务，再尝试挂载；如果挂载不上，可尝试在后面加 `-o nolock` 参数。
 
#### 3、查看客户端挂载的目录是否具备读写权限，添加相应权限即可。

添加相应目录的权限 `chmod -R 777 /test/fileServer`

### 问题二

#### 1、服务端 rpcbind 启动顺序问题

```
mount.nfs: Connection timed out
```

使用 `showmount -e ip` 检测服务端服务器情况的是，会出现 `clnt_create: RPC: Program not registered` ,这个错误，表示rpc程序为注册成功;

**解决方案 :**

服务器上先停止rpcbind

```
/etc/init.d/rpcbind stop
```

然后在停止nfs

```
/etc/init.d/nfs stop
```

最后在启动 rpcbind 和nfs ，一定要按顺序启动和停止(先启动rpcbind)

```
/etc/init.d/rpcbind start
/etc/init.d/nfs start
 ```