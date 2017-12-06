---
layout: post
title:  Raspbian Pi
description: "树莓派(Raspberry Pi)是由树莓派基金会研发的一种只有信用卡大小的单板机电脑，最初的设计目标是用较为廉价的硬件和开源软件为儿童提供一个计算机教育平台。但其优秀的扩展性和易于开发的特性，使其不仅仅用于儿童教育，更是成为了极客们的玩具。树莓派被开发出了千千万万种玩法，并且普通人也可以轻松实现。"
modified: 2017-12-03 17:20:20
tags: [Raspbian Pi,Raspberry Pi,Raspbian,Mac,树莓派]
post_type: developer
categories: [Raspbian Pi]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---
## 1. 什么是树莓派（Raspberry Pi）

树莓派(Raspberry Pi)是由树莓派基金会研发的一种只有信用卡大小的单板机电脑，最初的设计目标是用较为廉价的硬件和开源软件为儿童提供一个计算机教育平台。但其优秀的扩展性和易于开发的特性，使其不仅仅用于儿童教育，更是成为了极客们的玩具。树莓派被开发出了千千万万种玩法，并且普通人也可以轻松实现。

**指示灯**

首先还是要从外观说起。在3B上面指示灯只有两个，一个红灯一个绿灯。

红灯是电源灯，在接通电源后就会常亮，如果你发现红灯在闪烁的话，说明电源质量不佳，可能是功率问题，也可能是接触不良，建议重新插拔或者尝试更换供电源。（用电脑的USB供电一定是不够用的，充电宝的话一定要选择支持快充输出的。若是充电器的话，注意充电规格最低保证5V、1A，如果可以请保证5V、2A）

绿灯是读写指示灯，在储存卡发生数据读写是会闪烁，你可以通过它判断下载是否在继续之类的运行状态。

## 2. 烧录系统

### 2.1 下载镜像

这里，我还是以 Raspbian OS 为例，其他 OS 都是一样的。
首先下载系统镜像文件：[Raspbian OS][1].


这里有两个版本，分别是 Raspbian Stretch With Desktop 和 Raspbian Stretch Lite，它们的区别在于前者带有 Desktop 的图形界面易用性更高，后者是不带图形界面的版本，特点是占用空间非常小。

作为学习，我推荐下载 aspbian Stretch With Desktop，等熟练之后，再根据需求选择其他 OS 都是可以的。

下载好之后是一个 ZIP 文件，把它解压出来，放在合适的位置备用。

官方推荐使用7Zip (Windows)或The Unarchiver来解压

### 2.2 Mac下烧录系统

1、打开终端，输入`diskutil list`

![Alt text]({{site.url}}/images/posts_image/raspberry-init-2017-12-03_00001.png)

从结果中我们可以看到我的USB驱动器的位置是「/dev/disk2」，并把这个位置牢牢记住



2、接着取消挂载（并不是弹出！）该驱动器：

```
diskutil umountDisk /dev/disk2
```


3、用dd命令写入U盘

说明：sudo dd if=源路径 of=/dev/r卷标 bs=1m ［‘r’ 会让命令执行加快一点］ ［‘bs’为一次填充的容量］

```
sudo dd if=/2017-11-29-raspbian-stretch.img of=/dev/rdisk2 bs=1m
```
等待

查看磁盘进度，可以用iostat命令查看磁盘写入状态`iostat -w 2`

4、操作完毕后将U盘弹出`diskutil eject /dev/disk2`

## 3. 更改SSH配置已经连接WiFi


### 3.1 开启派的SSH登录
现在的Raspbian的SSH设置成了默认关闭状态。官方说出于安全考虑

但要开启Raspbian OS的SSH，其实方法简单到不能再简单了，没有显示器也是可以的
在SD卡boot的根目录新建一个名为SSH的没有扩展名的文件

### 3.2 配置WiFi

如果有网线的话直接插上网线就可以了，
插入网线之后可以修改如下配置，来配置WiFi
`/etc/wpa_supplicant/wpa_supplicant.conf`

但如果没有网线只有WiFi的话请看如下配置

同意在boot根目录下新建一个wpa_supplicant.conf文件件,添加如下内容

```
country=GB
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
network={
  ssid="将我替换成Wi-Fi名"
  psk="将我替换成Wi-Fi密码"
  priority=将我替换成数字，数字越大代表优先级越高
}
```

保存后和SSH文件一样，放入boot文件夹，之后给Raspbian上电，稍等几分钟，就会连上Wi-Fi了(如果有多个WiFi就配置多个network就可以了)。

然后通过ssh就可以连上Raspbian了，如果你是智能路由器，直接在路由器的app里就可以看到派的ip了,使用`ssh pi@X.X.X.X` 就可以了

但如果你无法看到ip的话，可以使用`ssh pi@raspberrypi.local`登录

这个命令的含义是：使用SSH方式连接 用pi账户登录 设备hostname为raspberrypi 在本局域网中

- Raspbian的默认账户是：pi

- pi账户的默认密码是：raspberry

- 修改root用户密码`sudo passwd root`

- 然后启用Root账户，命令行输入：`sudo passwd --unlock root`

- 切换root账户：`su root`


## 4. 更换镜像源
更换国内镜像源
这是一个非常重要的知识点。众所周知，树莓派的服务器在国外，所以对于在国内的我们来说，下载或更新非常的缓慢。

好在国内有很多大学或者机构把国外的服务器做了镜像拷贝，并且免费供我们使用。我们只需要把地址更换成国内的地址，就可以大大提升速度和稳定性。

```
sudo vi /etc/apt/sources.list
```
添加镜像源如下

![Alt text]({{site.url}}/images/posts_image/raspberry-init-2017-12-03_00002.jpg)

地址不一定要和上面演示的一致，你可以自由选择镜像站。我这里列出几个国内常见Raspbian OS镜像站及地址。

清华大学开源软件镜像站：
```
deb http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ jessie main non-free contrib
deb-src http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ jessie main non-free contrib
```
中国科学技术大学Linux用户协会：
```
deb http://mirrors.ustc.edu.cn/raspbian/raspbian/ jessie main non-free contrib
deb-src http://mirrors.ustc.edu.cn/raspbian/raspbian/ jessie main non-free contrib
```
浙江大学开源镜像站：
```
deb http://mirrors.zju.edu.cn/raspbian/raspbian/ jessie main contrib non-free rpi
deb-src http://mirrors.zju.edu.cn/raspbian/raspbian/ jessie main contrib non-free rpi
```
华中科技大学开源镜像站：
```
deb http://mirrors.hust.edu.cn/raspbian/raspbian/ wheezy main non-free contrib
deb-src http://mirrors.hust.edu.cn/raspbian/raspbian/ wheezy main non-free contrib
```
阿里巴巴开源镜像站：
```
deb http://mirrors.aliyun.com/raspbian/raspbian/ wheezy main non-free contrib
deb-src http://mirrors.aliyun.com/raspbian/raspbian/ wheezy main non-free contrib
```

替换完之后执行
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
```
update是更新列表，upgrade是更新所有已安装的app。




[1]: https://www.raspberrypi.org/downloads/raspbian/
