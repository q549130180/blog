---
layout: post
title:  创建一个简单的 Spring Boot 应用
description: "首先声明，Spring Boot不是一门新技术，所以不用紧张。从本质上来说，Spring Boot就是Spring,它做了那些没有它你也会去做的Spring Bean配置。所以我们这里先讲一下 Spring Boot 最基本的项目创建和启动项目。来对 Spring Boot 做一个基本的了解"
modified: 2018-12-11 15:20:20
tags: [Spring Boot,Spring,Java]
post_type: developer
series: Spring Boot 系列文章
blogid: 201812110001
categories: [Spring Boot]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---


## 1. 概述

### 1.1 简介

首先声明，Spring Boot不是一门新技术，所以不用紧张。从本质上来说，Spring Boot就是Spring,它做了那些没有它你也会去做的Spring Bean配置。它使用“习惯优于配置”（项目中存在大量的配置，此外还内置了一个习惯性的配置，让你无需手动进行配置）的理念让你的项目快速运行起来。使用Spring Boot很容易创建一个独立运行（运行jar,内嵌Servlet容器）、准生产级别的基于Spring框架的项目，使用Spring Boot你可以不用或者只需要很少的Spring配置。


Spring将很多魔法带入了Spring应用程序的开发之中，其中最重要的是以下四个核心。

- 自动配置：针对很多Spring应用程序常见的应用功能，Spring Boot能自动提供相关配置
- 起步依赖：告诉Spring Boot需要什么功能，它就能引入需要的库。
- 命令行界面：这是Spring Boot的可选特性，借此你只需写代码就能完成完整的应用程序，无需传统项目构建。
- Actuator：让你能够深入运行中的Spring Boot应用程序，一探究竟。

### 1.2 环境

- JDK 8
- SpringBoot 2.0.2.RELEASE
- IntelliJ IDEA 2017.2

## 2. 创建 Spring Boot 项目

### 2.1 通过IntelliJ IDEA 创建Spring boot项目

【Create New Project】 -> 【Spring lnitializr】

![springboot](http://image.lingfeng.me/images/springboot/springboot_2018_05_31_002.jpg)

![springboot](http://image.lingfeng.me/images/springboot/springboot_2018_05_31_003.jpg)

![springboot](http://image.lingfeng.me/images/springboot/springboot_2018_05_31_004.jpg)

![springboot](http://image.lingfeng.me/images/springboot/springboot_2018_05_31_005.jpg)

### 2.2 项目结构

根据上面的操作已经初始化了一个Spring Boot的框架了，项目结构如下：

![springboot](http://image.lingfeng.me/images/springboot/springboot_2018_05_31_006.jpg)

如你所见，项目里面基本没有代码，除了几个空目录外，还包含如下几样东西。

- `pom.xml`：Maven构建说明文件。
- `LingApplication.java`：一个带有main()方法的类，用于启动应用程序（关键）。
- `LingApplicationTests.java`：一个空的Junit测试类，它加载了一个使用Spring Boot字典配置功能的Spring应用程序上下文。
- `application.properties`：一个空的properties文件，你可以根据需要添加配置属性。

## 3. POM 文件说明

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>me.lingfeng</groupId>
	<artifactId>ling</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>ling</name>
	<description>Demo project for Spring Boot</description>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.0.2.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<!-- 打包spring boot 应用 -->
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>


</project>

```


### 3.1 Spring Boot 父级依赖

这块配置就是Spring Boot父级依赖，有了这个，当前的项目就是Spring Boot项目了，`spring-boot-starter-parent`是一个特殊的`starter`,它用来提供相关的Maven默认依赖，使用它之后，常用的包依赖可以省去`version`标签。关于Spring Boot提供了哪些`jar`包的依赖,可查看`.m2/repository/org/springframework/boot/spring-boot-dependencies/2.0.2.RELEASE/spring-boot-dependencies-2.0.2.RELEASE.pom`

```xml
<properties>
        <activemq.version>5.15.3</activemq.version>
        <antlr2.version>2.7.7</antlr2.version>
        <appengine-sdk.version>1.9.63</appengine-sdk.version>
        <artemis.version>2.4.0</artemis.version>
        <aspectj.version>1.8.13</aspectj.version>
        <assertj.version>3.9.1</assertj.version>
        <atomikos.version>4.0.6</atomikos.version>
        <bitronix.version>2.1.4</bitronix.version>
        <build-helper-maven-plugin.version>3.0.0</build-helper-maven-plugin.version>
        <byte-buddy.version>1.7.11</byte-buddy.version>
        <caffeine.version>2.6.2</caffeine.version>
        <cassandra-driver.version>3.4.0</cassandra-driver.version>
        <classmate.version>1.3.4</classmate.version>
        <commons-codec.version>1.11</commons-codec.version>
        <commons-dbcp2.version>2.2.0</commons-dbcp2.version>
        <commons-lang3.version>3.7</commons-lang3.version>
        <commons-pool.version>1.6</commons-pool.version>
        <commons-pool2.version>2.5.0</commons-pool2.version>
        <couchbase-cache-client.version>2.1.0</couchbase-cache-client.version>
        
        [ 省略若干... ]
        
    </properties>
```

### 3.2 修改版本依赖

如果你不想使用某个依赖默认的版本，您还可以通过覆盖自己的项目中的属性来覆盖各个依赖项，例如，要升级到另一个Spring Data版本系列，您可以将`<spring-data-releasetrain.version>Fowler-SR2</spring-data-releasetrain.version>`添加到`pom.xml`文件的`<properties>`中。

```xml
<properties>
	<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	<spring.boot.version>2.0.2.RELEASE</spring.boot.version>
	<spring-data-releasetrain.version>Fowler-SR2</spring-data-releasetrain.version>
	<jdk.version>1.8</jdk.version>
</properties>
```

现在就使用Fowler-SR2版本了

### 3.3 起步依赖 spring-boot-starter-xxx

Spring Boot提供了很多”开箱即用“的依赖模块，都是以spring-boot-starter-xx作为命名的。举个例子来说明一下这个起步依赖的好处，比如组装台式机和品牌机，自己组装的话需要自己去选择不同的零件，最后还要组装起来，期间有可能会遇到零件不匹配的问题。耗时又消力，而品牌机就好一点，买来就能直接用的，后续想换零件也是可以的。相比较之下，后者带来的效果更好点（这里就不讨论价格问题哈），起步依赖就像这里的品牌机，自动给你封装好了你想要实现的功能的依赖。就比如我们之前要实现web功能，引入了spring-boot-starter-web这个起步依赖。我们来看看spring-boot-starter-web到底依赖了哪些,如下图：

![springboot](http://image.lingfeng.me/images/springboot/springboot_2018_05_31_001.jpg)

看来依赖了好多呢，如果让我自己弄估计要调半天，所以Spring Boot通过提供众多起步依赖降低项目依赖的复杂度。起步依赖本质上是一个Maven项目对象模型（Project Object Model，POM），定义了对其他库的传递依赖，这些东西加在一起即支持某项功能。很多起步依赖的命名都暗示了它们提供的某种或者某类功能。

### 3.4 Spring Boot Maven 插件

```xml
<plugins>
    <!-- 打包spring boot 应用 -->
    <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
</plugins>
```

上面的配置就是Spring Boot Maven插件，Spring Boot Maven插件提供了许多方便的功能：

- 把项目打包成一个可执行的超级JAR（uber-JAR）,包括把应用程序的所有依赖打入JAR文件内，并为JAR添加一个描述文件，其中的内容能让你用java -jar来运行应用程序。
- 搜索 `public static void main()` 方法来标记为可运行类。

## 4. 应用入口类

### 4.1 编辑启动类

在`src/main/java/me/lingfeng/ling`目录下会有一个 `LingApplication.java` 文件,写入如下内容

```java
@RestController
@SpringBootApplication
public class LingApplication {

	@RequestMapping("/")
	public String index(){
		return " Hello Spring Boot";
	}

	public static void main(String[] args) {
		SpringApplication.run(LingApplication.class, args);
	}
}
```

##### 说明

1. `@SpringBootApplication`是Sprnig Boot项目的核心注解，主要目的是开启自动配置。后续讲解原理的时候再深入介绍。
2. `main`方法这是一个标准的Java应用的`main`的方法，主要作用是作为项目启动的入口。

3. `@RestController`注解等价于 `@Controller` + `@ResponseBody` 的结合，使用这个注解的类里面的方法都以 json 格式输出。

启动项目。由于我们使用了 `spring-boot-starter-parent POM`，所以可以使用 `mvn spring-boot:run`来启动项目（根路径），或者直接运行main方法

启动之后就可以访问了，默认地址： `http://localhost:8080` 即可

### 4.2 运行 fat jar（executable jar）

`java -jar target/xxxx.jar`  注意，是在项目路径下执行。
