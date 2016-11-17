zabbix（音同 zæbix）是一个基于WEB界面的提供分布式系统监视以及网络监视功能的企业级的开源解决方案。
zabbix能监视各种网络参数，保证服务器系统的安全运营；并提供灵活的通知机制以让系统管理员快速定位/解决存在的各种问题。
zabbix由2部分构成，zabbix server与可选组件zabbix agent。
zabbix server可以通过SNMP，zabbix agent，ping，端口监视等方法提供对远程服务器/网络状态的监视，数据收集等功能，它可以运行在Linux，Solaris，HP-UX，AIX，Free BSD，Open BSD，OS X等平台上。


我比较看好zabbix这款监控软件，理由如下：
1.分布式监控，天生具有的功能，适合于构建分布式监控系统，具有node，proxy2种分布式模式
2.自动化功能，自动发现，自动注册主机，自动添加模板，自动添加分组，是天生的自动化运维利器的首选，当然于自动化运维工具搭配，puppet+zabbix，或者saltstack+zabbix，那是如鱼得水。
3.自定义监控比较方便，自定义监控项非常简单，支持变量，支持low level discovery，可以参考我写的文档自动化运维之监控篇---利用zabbix自动发现功能实现批量web url监控
4.触发器，也就是报警条件有多重判断机制，当然，这个需要你去研究一下，这也是zabbix的精华之处，


官网：http://www.zabbix.org.cn/
中文社区：http://www.zabbix.org.cn/
