---
layout: post
title:  Cent OS7 网卡配置
description: "CentOS的网卡相关配置，使用配置文件对CentOS的网卡进行配置."
modified: 2017-11-29 15:20:20
tags: [Linux,Cent OS,network,网卡,CentOS网卡]
post_type: developer
blogid: 201711290001
categories: [Cent OS]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 网络相关目录说明

```
/etc/sysconfig/network # 包括主机基本网络信息，用于系统启动
/etc/sysconfig/network-script/ # 此目录下是系统启动最初始化网络的信息
/etc/sysconfig/network-script/ifcfg-em1 # 网络配置信息，每个人的配置名字不一样通过命令查看
/etc/xinetd.conf #定义了由超级进程XINETD启动的网络服务
/etc/protocols # 设定了主机使用的协议以及各个协议的协议号
/etc/services  # 设定了主机的不同端口的网络服务
```


执行`ifconfig`查看当前网卡信息
![Alt text]({{site.url}}/images/posts_image/centos_network_2017-11-29_00001.jpg)


## 2. ip命令工具

ip [选项] 操作对象 `{link|addr|route...}`

```
ip link show                      # 显示网络接口信息
ip link set eth0 upi              # 开启网卡
ip link set eth0 down             # 关闭网卡
ip link set eth0 promisc on       # 开启网卡的混合模式
ip link set eth0 promisc offi     # 关闭网卡的混个模式
ip link set eth0 txqueuelen 1200  # 设置网卡队列长度
ip link set eth0 mtu 1400         # 设置网卡最大传输单元

ip addr show                      # 显示网卡IP信息
ip addr add 192.168.0.1/24 dev eth0 # 设置eth0网卡IP地址192.168.0.1
ip addr del 192.168.0.1/24 dev eth0 # 删除eth0网卡IP地址

ip route list                     # 查看路由信息
ip route add 192.168.4.0/24  via  192.168.0.254 dev eth0 # 设置192.168.4.0网段的网关为192.168.0.254,数据走eth0接口
ip route add default via  192.168.0.254  dev eth0        # 设置默认网关为192.168.0.254
ip route del 192.168.4.0/24       # 删除192.168.4.0网段的网关
ip route del default              # 删除默认路由
```



## 3. ip配置

通过 `ip addr` 命令 查看ip。看到两个配置，lo 和 eno16777736 ，lo代表127.0.0.1，即localhost。eno16777736这个是你的网卡，如果上面没有 inet 字段后面跟着 IP 的话，你需要去配置文件中修改配置。

默认配置文件在这里 `/etc/sysconfig/network-scripts/ifcfg-eno16777736` ，一般情况这个配置文件是 ifcfg-<网卡名字> 加上你网卡名字.

编辑配置文件`vim /etc/sysconfig/network-scripts/ifcfg-eno16777736`

主要更改这两项：BOOTPROTO=dhcp、ONBOOT=yes，如果修改静态ip，则添加静态ip的设置信息，下面是我的配置文件

```
HWADDR=***********
# TYPE：配置文件接口类型。在/etc/sysconfig/network-scripts/目录有多种网络配置文件，有Ethernet 、IPsec等类型，网络接口类型为Ethernet。
TYPE=Ethernet
BOOTPROTO=none          # 静态ip,若该值为dhcp则是自动获取IP,若该值为static也表示静态ip地址
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes            # 是否执行IPv6。yes：支持IPv6。no：不支持IPv6。
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
NAME=eno16777736        # 网卡名称
UUID=0286d98a-c81****** # UUID号，没事不要动它，否则你会后悔的
ONBOOT=yes              # 设置网络开机自动启动
MACADDR=***********
PROXY_METHOD=none
BROWSER_ONLY=no

# 如果设置静态ip添加如下设置
IPADDR=172.16.165.100   # 设置IP地址
PREFIX=24               # 设置子网掩码，24为255.255.255.0
GATEWAY=172.16.165.2    # 设置网关
DNS1=8.8.8.8            # 设置主DNS
DNS2=8.8.4.4            # 设置备DNS
```

## 4. 网卡相关命令

### 4.1 启动和关闭网卡命令

```
ifup <设备名>    # 激活网卡 {网卡名字}
ifdown <设备名>  # 关闭网卡
ifup em1  # 激活网卡 em1
```

### 4.2 重启/停止/查看网络

```
service network start    # 启动网络服务
service network stop     # 停止网络服务
service network restart  # 重启网络服务
service network status   # 查看网络服务状态
nmcli dev status         # 检查受网络管理器管理的网络接口
systemctl status NetworkManager.service # 验证网络管理器服务的状态
```


## 5. 其它相关名词解释

- wlan0 表示第一块无线以太网卡
- Link encap 表示该网卡位于OSI物理层(Physical Layer）的名称
- HWaddr 表示网卡的MAC地址（Hardware Address）
- inet addr 表示该网卡在TCP/IP网络中的IP地址
- Bcast 表示广播地址（Broad Address）
- Mask 表示子网掩码（Subnet Mask）
- MTU 表示最大传送单元，不同局域网 MTU值不一定相同，对以太网来说，MTU的默认设置是1500个字节
- Metric 表示度量值，通常用于计算路由成本
- RX 表示接收的数据包
- TX 表示发送的数据包
- collisions 表示数据包冲突的次数
- txqueuelen 表示传送列队（Transfer Queue）长度
- interrupt 表示该网卡的IRQ中断号
- Base address 表示I/O地址
