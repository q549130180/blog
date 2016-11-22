---
layout: post
title:  ActiveMQ 简单实例
description: "ActiveMQ 是Apache出品，最流行的，能力强劲的开源消息总线。ActiveMQ 是一个完全支持JMS1.1和J2EE 1.4规范的 JMS Provider实现，尽管JMS规范出台已经是很久的事情了，但是JMS在当今的J2EE应用中间仍然扮演着特殊的地位。<br/> 本文将讲述使用ActiveMQ客户端简单的操作ActiveMQ，使用客户端发送Queue和Topic，使用Listener接收Queue和Topic中的信息。"
modified: 2016-11-22 15:20:20
tags: [ActiveMQ,JMS,Java]
post_type: developer
series: ActiveMQ系列文章
categories: [ActiveMQ]
image:
  feature: posts_header/abstract-3.jpg
  credit:
  creditlink:
---




## 一、环境

- OS:Cent OS 7
- Java:JDK 1.7
- Zookeeper:3.3.3
- ActiveMQ:5.14.0

ActiveMQ的安装配置请参考上一篇文章[《ActiveMQ 高可用集群安装、配置》]({{ site.url }}/activemq/activemq-install/)

## 二、简单使用

### 1.添加Maven依赖

在pom.xml文件中添加如下依赖

```xml
<!-- activemq start -->
<dependency>  
    <groupId>org.apache.activemq</groupId>  
    <artifactId>activemq-all</artifactId>  
    <version>5.14.1</version>  
</dependency>  

<dependency>  
    <groupId>org.apache.activemq</groupId>  
    <artifactId>activemq-pool</artifactId>  
    <version>5.14.1</version>  
</dependency>
<!-- activemq end -->
```


### 2.配置文件

建立配置文件：`applicationContext-activemq-simple.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:context="http://www.springframework.org/schema/context"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:amq="http://activemq.apache.org/schema/core"
    xmlns:jms="http://www.springframework.org/schema/jms"
    xsi:schemaLocation="http://www.springframework.org/schema/beans   
        http://www.springframework.org/schema/beans/spring-beans-4.0.xsd   
        http://www.springframework.org/schema/context   
        http://www.springframework.org/schema/context/spring-context-4.0.xsd
        http://www.springframework.org/schema/jms
        http://www.springframework.org/schema/jms/spring-jms-4.0.xsd
        http://activemq.apache.org/schema/core
        http://activemq.apache.org/schema/core/activemq-core-5.8.0.xsd">


	<!-- 真正可以产生Connection的ConnectionFactory，由对应的 JMS服务厂商提供 -->
	<bean id="targetConnectionFactory" class="org.apache.activemq.ActiveMQConnectionFactory">
		<property name="brokerURL" value="tcp://10.10.5.223:61617" />
		<!-- 将该值开启官方说法是可以取得更高的发送速度（5倍）。 -->
		<property name="useAsyncSend" value="true" />
		<!-- 对于一个connection如果只有一个session，该值有效，否则该值无效，默认这个参数的值为true。 -->
		<property name="alwaysSessionAsync" value="true" />
		<property name="useDedicatedTaskRunner" value="true" />
	</bean>

	<!-- 点对点的队列 -->
	<bean id="destinationQueue" class="org.apache.activemq.command.ActiveMQQueue">
		<!-- 设置消息队列的名字 ,consumer.prefetchSize则代表我们在此使用“消费者”预分配协议，在消费者内在足够时可以使这个值更大以获得更好的吞吐性能。 -->
		<constructor-arg value="ymk.queue?consumer.prefetchSize=100" />
	</bean>

	<!-- 发布/订阅 -->
	<bean id="destinationTopic" class="org.apache.activemq.command.ActiveMQTopic">
		<!-- 设置消息队列的名字 ,consumer.prefetchSize则代表我们在此使用“消费者”预分配协议，在消费者内在足够时可以使这个值更大以获得更好的吞吐性能。 -->
		<constructor-arg value="ymk.topic?consumer.prefetchSize=100" />
	</bean>

	<!-- 设置事务型消息的重发机制,对于destination这个队列的重发机制为间隔100毫秒重发一次 -->
	<amq:redeliveryPolicy id="activeMQRedeliveryPolicy" destination="#destinationQueue" redeliveryDelay="100" maximumRedeliveries="1" />

</beans>  
```

### 3.点对点

**(1) Queue发送端代码**

```java
package me.lingfeng.activemq.test;

import javax.jms.Connection;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageProducer;
import javax.jms.Session;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 *
 * 点对点发送端
 *
 * @author Administrator
 *
 */
public class QueueSenderTest {
	public static void sendWithAuto() {
		ActiveMQConnectionFactory factory = null;
		Connection conn = null;
		Destination destination = null;
		Session session = null;
		MessageProducer producer = null;
		try {

			ApplicationContext context = new ClassPathXmlApplicationContext("classpath:/spring/applicationContext-activemq-simple.xml");
			// 获取队列
			destination = (Destination) context.getBean("destinationQueue");
			// 获取连接工厂
			factory = (ActiveMQConnectionFactory) context.getBean("targetConnectionFactory");
			conn = factory.createConnection();
			// 获取操作连接 ,true为事物型消息 false为简单消息
			session = conn.createSession(true, Session.AUTO_ACKNOWLEDGE);
			producer = session.createProducer(destination);
			// 发送的消息
			Message message = session.createTextMessage("Hello JMS Queue!");
			producer.send(message);

			session.commit();
		} catch (Exception e) {
			try {
				session.rollback();
			} catch (JMSException e1) {
				e1.printStackTrace();
			}
			e.printStackTrace();
		} finally {
			try {
				producer.close();
				producer = null;

				session.close();
				session = null;

				conn.stop();

				conn.close();
			} catch (Exception e) {
				e.printStackTrace();
			}

		}

	}

	public static void main(String[] args) {
		sendWithAuto();
	}
}

```

通过监控界面查看队列里的消息
![Alt text]({{site.url}}/images/posts_image/activemq_activemq_2016-10-18_145421.jpg)

**(2) Queue接收端代码**

```java
package me.lingfeng.activemq.test;

import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageListener;
import javax.jms.Session;
import javax.jms.TextMessage;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 *
 * 点对点接收监听
 *
 * @author Administrator
 *
 */
public class QueueConsumerListenerTest extends Thread implements MessageListener {
	private Destination destination = null;
	private Session session = null;

	public void run() {
		receive();
	}

	public void receive() {
		ConnectionFactory factory = null;
		Connection conn = null;
		try {
			final ApplicationContext context = new ClassPathXmlApplicationContext("classpath:/spring/applicationContext-activemq-simple.xml");
			factory = (ActiveMQConnectionFactory) context.getBean("targetConnectionFactory");
			conn = factory.createConnection();
			conn.start();
			session = conn.createSession(true, Session.AUTO_ACKNOWLEDGE);
			destination = (Destination) context.getBean("destinationQueue");
			MessageConsumer consumer = session.createConsumer(destination);
			consumer.setMessageListener(this);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void onMessage(Message message) {

		try {
			// 接收到的消息
			TextMessage tm = (TextMessage) message;
			System.out.println("QueueConsumerListenerTest Receive Message: " + tm.getText());

			session.commit();
		} catch (Exception e) {
			try {
				session.rollback();
			} catch (JMSException e1) {
				e1.printStackTrace();
			}
			e.printStackTrace();
		}

	}

	public static void main(String[] args) {
		QueueConsumerListenerTest tranConsumer = new QueueConsumerListenerTest();
		tranConsumer.start();
	}
}

```

通过监控界面查看接收者信息
![Alt text]({{site.url}}/images/posts_image/activemq_activemq_2016-10-18_150058.jpg)


### 4.发布/订阅

**(1) Topic发送端代码**

```java
package me.lingfeng.activemq.test;

import javax.jms.Connection;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageProducer;
import javax.jms.Session;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 *
 * 发布/订阅发送端
 *
 * @author Administrator
 *
 */
public class TopicSenderTest {
	public static void sendWithAuto() {
		ActiveMQConnectionFactory factory = null;
		Connection conn = null;
		Destination destination = null;
		Session session = null;
		MessageProducer producer = null;
		try {

			ApplicationContext context = new ClassPathXmlApplicationContext("classpath:/spring/applicationContext-activemq-simple.xml");
			// 获取队列
			destination = (Destination) context.getBean("destinationTopic");
			// 获取连接工厂
			factory = (ActiveMQConnectionFactory) context.getBean("targetConnectionFactory");
			conn = factory.createConnection();
			// 获取操作连接 ,true为事物型消息 false为简单消息
			session = conn.createSession(true, Session.AUTO_ACKNOWLEDGE);
			producer = session.createProducer(destination);
			// 发送的消息
			Message message = session.createTextMessage("Hello JMS Topic!");
			producer.send(message);

			session.commit();
		} catch (Exception e) {
			try {
				session.rollback();
			} catch (JMSException e1) {
				e1.printStackTrace();
			}
			e.printStackTrace();
		} finally {
			try {
				producer.close();
				producer = null;

				session.close();
				session = null;

				conn.stop();

				conn.close();
			} catch (Exception e) {
				e.printStackTrace();
			}

		}

	}

	public static void main(String[] args) {
		sendWithAuto();
	}
}

```

**(2) Topic接收端代码**

```java
package me.lingfeng.activemq.test;

import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageListener;
import javax.jms.Session;
import javax.jms.TextMessage;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 *
 * 发布/订阅接收监听
 *
 * @author Administrator
 *
 */
public class TopicConsumerListenerTest extends Thread implements MessageListener {
	private Destination destination = null;
	private Session session = null;

	public void run() {
		receive();
	}

	public void receive() {
		ConnectionFactory factory = null;
		Connection conn = null;
		try {
			final ApplicationContext context = new ClassPathXmlApplicationContext("classpath:/spring/applicationContext-activemq-simple.xml");
			factory = (ActiveMQConnectionFactory) context.getBean("targetConnectionFactory");
			conn = factory.createConnection();
			conn.start();
			session = conn.createSession(true, Session.AUTO_ACKNOWLEDGE);
			destination = (Destination) context.getBean("destinationTopic");
			MessageConsumer consumer = session.createConsumer(destination);
			consumer.setMessageListener(this);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void onMessage(Message message) {

		try {
			// 接收到的消息
			TextMessage tm = (TextMessage) message;
			System.out.println("TopicConsumerListenerTest Receive Message: " + tm.getText());

			session.commit();
		} catch (Exception e) {
			try {
				session.rollback();
			} catch (JMSException e1) {
				e1.printStackTrace();
			}
			e.printStackTrace();
		}

	}

	public static void main(String[] args) {
		TopicConsumerListenerTest tranConsumer = new TopicConsumerListenerTest();
		tranConsumer.start();
	}
}

```
