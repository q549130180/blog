centos 7 配置VPN



安装依赖组件
安装完epel源以后就可以直接安装依赖组件了。

yum install -y openswan ppp pptpd xl2tpd wget



修改配置文件

ipsec.conf配置文件（/etc/ipsec.conf）
在文件末尾添加以下内容
```shell

conn L2TP-PSK-NAT
    rightsubnet=vhost:%priv
    also=L2TP-PSK-noNAT
conn L2TP-PSK-noNAT
    authby=secret
    pfs=no
    auto=add
    keyingtries=3
    rekey=no
    ikelifetime=8h
    keylife=1h
    type=transport
    left=45.62.96.30  #这边替换成你的本机IP
    leftid=45.62.96.30  #这边替换成你的本机IP
    leftprotoport=17/1701
    right=%any
    rightprotoport=17/%any
    dpddelay=40
    dpdtimeout=130
    dpdaction=clear


```



设置预共享密钥配置文件（/etc/ipsec.secrets）

```shell
45.62.96.30     %any:PSK       "test1234"    #ip地址替换成你的本机ip,"test1234"配置成自己的秘钥
```




pptpd.conf配置文件(/etc/pptpd.conf)

```shell
#ppp /usr/sbin/pppd
option /etc/ppp/options.pptpd
#debug
# stimeout 10
#noipparam
logwtmp
#vrf test
#bcrelay eth1
#delegate
#connections 100
localip 192.168.0.1
remoteip 192.168.0.234-238,192.168.0.245
```



xl2tpd.conf配置文件(/etc/xl2tpd/xl2tpd.conf)

```shell
[global]
listen-addr = 45.62.96.30   #改成自己本机的IP
ipsec saref = yes
[lns default]
ip range = 192.168.1.128-192.168.1.254    #分配的客户端IP
local ip = 192.168.1.1                 #本地IP  不用改
refuse chap = yes                     #改成refuse
refuse pap = yes
require authentication = yes
name = l2tp
ppp debug = yes
pppoptfile = /etc/ppp/options.xl2tpd
length bit = yes
```


options.pptpd配置文件(/etc/ppp/options.pptpd)

```shell
# Authentication
name pptpd
#chapms-strip-domain
# Encryption
# BSD licensed ppp-2.4.2 upstream with MPPE only, kernel module ppp_mppe.o
# {{{
refuse-pap
refuse-chap
refuse-mschap
# Require the peer to authenticate itself using MS-CHAPv2 [Microsoft
# Challenge Handshake Authentication Protocol, Version 2] authentication.
require-mschap-v2
# Require MPPE 128-bit encryption
# (note that MPPE requires the use of MSCHAP-V2 during authentication)
require-mppe-128
# }}}
# OpenSSL licensed ppp-2.4.1 fork with MPPE only, kernel module mppe.o
# {{{
#-chap
#-chapms
# Require the peer to authenticate itself using MS-CHAPv2 [Microsoft
# Challenge Handshake Authentication Protocol, Version 2] authentication.
#+chapms-v2
# Require MPPE encryption
# (note that MPPE requires the use of MSCHAP-V2 during authentication)
#mppe-40    # enable either 40-bit or 128-bit, not both
#mppe-128
#mppe-stateless
# }}}
ms-dns 8.8.4.4
ms-dns 8.8.8.8
#ms-wins 10.0.0.3
#ms-wins 10.0.0.4
proxyarp
#10.8.0.100
# Logging
#debug
#dump
lock
nobsdcomp
novj
novjccomp
nologfd
```


options.xl2tpd配置文件(/etc/ppp/options.xl2tpd)

```shell

ipcp-accept-local
ipcp-accept-remote
require-mschap-v2
ms-dns 8.8.8.8
ms-dns 8.8.4.4
asyncmap 0
auth
crtscts
lock
hide-password
modem
debug
name l2tpd
proxyarp
lcp-echo-interval 30
lcp-echo-failure 4
mtu 1400
noccp
connect-delay 5000
# To allow authentication against a Windows domain EXAMPLE, and require the
# user to be in a group "VPN Users". Requires the samba-winbind package
# require-mschap-v2
# plugin winbind.so
# ntlm_auth-helper '/usr/bin/ntlm_auth --helper-protocol=ntlm-server-1 --require-membership-of="EXAMPLE\VPN Users"'
# You need to join the domain on the server, for example using samba:
# http://rootmanager.com/ubuntu-ipsec-l2tp-windows-domain-auth/setting-up-openswan-xl2tpd-with-native-windows-clients-lucid.html
```


创建chap-secrets配置文件，即用户列表及密码(/etc/ppp/chap-secrets)


```shell
# Secrets for authentication using CHAP
# client     server     secret               IP addresses
username          pptpd     password               *
username          l2tpd     password               *
username          *         password               *
```

注解：第三第四行中username为登录名，password为登录密码



修改系统配置文件/etc/sysctl.conf  在结尾添加

```
net.ipv4.ip_forward = 1
net.ipv4.conf.default.rp_filter = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.log_martians = 0
net.ipv4.conf.default.log_martians = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.icmp_ignore_bogus_error_responses = 1

```


执行 sysctl -p 是上面的设置生效




允许防火墙端口

创建文件/usr/lib/firewalld/services/pptpd.xml并修改：

```xml
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>pptpd</short>
  <description>PPTP</description>
  <port protocol="tcp" port="1723"/>
</service>
```
创建文件/usr/lib/firewalld/services/l2tpd.xml并修改：

```xml
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>l2tpd</short>
  <description>L2TP IPSec</description>
  <port protocol="udp" port="500"/>
  <port protocol="udp" port="4500"/>
  <port protocol="udp" port="1701"/>
</service>
```

初始化并重启防火墙：

```shell
firewall-cmd --reload
firewall-cmd --permanent --add-service=pptpd
firewall-cmd --permanent --add-service=l2tpd
firewall-cmd --permanent --add-service=ipsec
firewall-cmd --permanent --add-masquerade
firewall-cmd --permanent --direct --add-rule ipv4 filter FORWARD 0 -p tcp -i ppp+ -j TCPMSS --syn --set-mss 1356
firewall-cmd --reload
```

这里是由于CentOS7自带firewall，并且不预装iptables，因此自己也不多此一举去安装了，因为效果都是一样的。

启动并设置开机自启动服务

```shell
systemctl enable pptpd ipsec xl2tpd
systemctl restart pptpd ipsec xl2tpd
```
