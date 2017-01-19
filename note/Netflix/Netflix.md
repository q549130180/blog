Netflix 的开源文化与技术
在之前的新闻《Netflix企业文化与架构设计》一文中我们介绍了Netflix高扩展的企业文化与架构，而作为一家在线影片租赁提供商 Netflix之所以能够在如此大量的用户、海量的数据、复杂的拓扑结构下取得成功，离不开其背后的开源文化与技术。Netflix利用开源或者自己开发 的技术，让公司能够在分布于全世界50多个国家的服务器上进行持续地构建和集成；能够对用户所产生的海量行为数据进行分析挖掘从而更好地推荐和改善自身服 务；同时能够通过性能剖析和安全审计保护用户的隐私和数据，下面就让我们来盘点一下Netflix所使用或贡献的开源技术。

大数据

数据是无价的，为了向客户提供极致的服务，Netflix拥有一套完善的大数据技术生态系统用于用户数据的分析和挖掘。Netflix不仅使用 Hadoop、Hive、Pig、Parquet、Presto以及Spark等被广泛采用的开源技术，同时还开发并贡献了一些其他的工具和服务。

Genie：专为Hadoop生态系统定制的一组REST-ful服务集合，用于管理作业和资源,它有两个关键的服务：Execution
Service和Configuration Serice。前者提供了REST-ful
API，用于提交和管理Hadoop、Hive以及Pig作业；后者是一个Hadoop资源的有效储存库，处理元数据的连接以及运行资源上的作业。
Inviso：对Hadoop作业和集群的性能进行详细而深入的剖析。
Lipstick：以一种清晰且可视化的方式展示Pig作业的工作流。
Aegisthus：是一个能够读取Cassandra
SSTable的map/reduce程序，Netflix的大数据平台每天都会利用该工具从Cassandra中读取数据进行分析。
构建和交付工具

Nebula：Netflix开源的Gradle插件集合，可以让开发者更容易地使用Gradle构建、测试和部署项目。
Aminator：EBS AMI创建工具，支持CentOS/RedHat Linux镜像，利用该工具创建的镜像能够运行在EC2实例上。
Asgard：云部署和管理工具，该工具与Aminator配合使用，能够将打包后的AMI从开发者的桌面部署到AWS上。
通用的运行时服务和类库

Netflix的大部分服务都是以云平台为基础和技术栈，云平台由云服务、应用程序类库和应用容器组成，每一部分Netflix都有相应的技术保障。

Eureka：Netflix的云平台服务发现技术。
Archaius：分布式配置工具。
Ribbon：弹性且智能化的进程处理和服务通信。
Hystrix：提供单一服务调用所不具备的可靠性，提供运行时的延迟隔离和容错。****
Karyon和Governator：JVM容器服务。
Prana sidecar：提供实例内代理，支持非JVM运行时。
Zuul：提供云部署周边的动态路由、监控、安全和弹性扩展等服务。
Fenzo：为云本地框架提供了更为高级的调度和资源管理功能，为装箱和集群自动扩展提供了插件实现，用户能通过自定义的插件实现自定义的调度优化。
数据持久化
面对每天数以万亿的行为数据，没有哪一种技术能够独自满足所有的用例，所有潜在的需求，为此Netflix不仅使用了Memcached和Redis等非 持久化内存存储方案，还使用了可搜索的数据存储Elastic，以及高可用的数据存储Cassandra和MySQL。此外，Netflix还创建了一些 其他的辅助工具：

Raigad 和 Priam：辅助Elastic和Cassandra集群的部署、管理、备份和恢复。
EVCache 和 Dynomite：用于大规模地使用Memcached和Redis。
Astyanax 和 Dyno 客户端类库：便于更好地使用云端数据库。
分析、可靠性和性能
在任何一个公司的运营中遥测和指标都具有至关重要的作用，高效的性能指令能够让工程师快速地从大量指标中找出自己所需要的那部分从而更快更有效地做出关键决策。除此之外，成本管理和资源在云端使用情况的可视化服务也不可或缺，Netflix在这些方面使用的工具包括：

Atlas：时间序列遥测平台，每分钟接收超过10亿的指标
Edda：跟踪云端变化的服务
Spectator类库：让Java应用程序代码能够更好地与Atlas集成
Vector：以最小的代价获得高分辨率主机级指标
Ice：监控当前成本和云使用趋势，让工程师能够更好地掌控自己的应用程序在当前环境中的状态
Simian Army：Netflix实例的随机故障测试，用于验证可靠性
安全
对任意类型、任意规模的公司来说安全都是一件越来越重要的事情，Netflix为开源社区贡献了大量的安全工具和解决方案，主要分为两类，一类是能够让安全团队更有效地保护大型动态环境的运维工具和系统；一类是为现代分布式系统提供严格安全服务的安全基础设施组件。

Security Monkey：用于检测和保护大规模的AWS环境
Scumblr：利用因特网进行针对性的搜索定位特定的安全问题并调查
MSL：一个可扩展的、灵活的安全消息协议，可解决大量安全通信用例和需求
用户界面
世界各地的Netflix会员会通过TV、手机和桌面等各式各样的设备观看视频，为此Netflix使用了Node.js、React和RxJS等先进的 UI技术构建富客户端应用程序。Netflix通过数据驱动的A/B测试实验新的理念，理解每一个功能特性的价值，从而持续地提升产品。此 外，Netflix还使用了以下工具。

Falcor：允许应用程序把所有远端的数据源用一个单独的JSON Graph来表示，提高了数据抓取效率
Restify：一个基于Nodejs的REST应用框架，支持服务器端和客户端
RxJS：JavaScript的Reactive扩展库
via InfoQ


http://www.infoq.com/cn/news/2015/11/Netflix-io-projects-intro

http://www.jdon.com/artichect/netflix.html

github:https://github.com/Netflix
官网：http://netflix.github.io/
