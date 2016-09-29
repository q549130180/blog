## 一、NFS服务器的安装

检查linux系统中是否安装了nfs-utils和rpcbind（老版本的系统是安装portmap） 两个软件包

命令#rpm –q nfs-utils rpcbind



## 二、查看NFS服务器是否启动

命令：

```
#service nfs starus
#service rpcbind status
```

## 三、如果服务器没有启动,则开启服务（默认服务下nfs没有完全开启）

命令：

```
#service nfs start
#service rpcbind start
```

## 四、指定NFS服务器的配置文件

NFS服务器的配置文件保存"/etc/"目录中,文件名称是"exports",该文件用于被指NFS服务器提供的目录共享

命令`vim /etc/exports`

配置"exports"文件格式如下

```
/home *（rw,sync,no_root_squash）

Home:共享目录名

*:表示所有主机

（sync,rw）:设置选项

exports文件中的"配置选项"字段放置在括号对（"（ ）"）中 ,多个选项间用逗号分隔

sync:设置NFS服务器同步写磁盘,这样不会轻易丢失数据,建议所有的NFS共享目录都使用该选项

ro:设置输出的共享目录只读,与rw不能共同使用

rw:设置输出的共享目录可读写,与ro不能共同使用

exports文件中"客户端主机地址"字段可以使用多种形式表示主机地址

192.168.152.13　指定IP地址的主机

nfsclient.test.com　指定域名的主机

192.168.1.0/24　指定网段中的所有主机

*.test.com　指定域下的所有主机

*　所有主机
```

例： `/staples/fileServer *(rw,sync,no_root_squash)`

```
upload *(rw,fsid=2)
/opt/vendorPortalFile   10.78.1.*(rw,sync,anonuid=501,anongid=501)
/opt/vendorPortalFile/pod 10.78.1.119(rw,fsid=1,sync,anonuid=501,anongid=501) 10.78.1.114(rw,fsid=1,sync,anonuid=501,anongid=501) 10.10.5.223(rw,fsid=1,sync,anonuid=501,anongid=501)
```



## 五、重启NFS服务器

    命令：

    ```
    #service nfs restart
    #service rpcbind restart
    ```

## 六、在客户端启动portmap服务

    命令：`service rpcbind start`

## 七、在客户端mount远程文件夹
    ` mount -t nfs 10.10.5.223:/staples/fileServer /staples/fileServer`
