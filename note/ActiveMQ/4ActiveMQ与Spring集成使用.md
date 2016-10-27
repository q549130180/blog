


## 环境

- Java:JDK 1.7
- Spring:4.0.9
- ActiveMQ:5.14.0
- Tomcat:7.x



pom.xml jar包引用

```xml
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
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jms</artifactId>
    <version>4.0.9.RELEASE</version>
</dependency>
```


ActiveMQ 配置文件applicationContext-activemq.xml

http://activemq.apache.org/objectmessage.html

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

	 <!-- 连接池  -->
    <bean id="pooledConnectionFactory" class="org.apache.activemq.pool.PooledConnectionFactory" destroy-method="stop">
        <property name="connectionFactory">
            <bean class="org.apache.activemq.ActiveMQConnectionFactory">
                <property name="brokerURL">
                    <value>tcp://10.10.5.223:61616</value>
                </property>
                <!-- 设置所有包为白名单，否则在传输对象的时候会抛异常 -->
                <property name="trustAllPackages" value="true"/>
            </bean>
        </property>
        <property name="maxConnections" value="100"></property>
    </bean>

	<!-- ActiveMQ 连接工厂 -->
    <!-- 真正可以产生Connection的ConnectionFactory，由对应的 JMS服务厂商提供-->
    <!-- 如果连接网络：tcp://ip:61616; 以及用户名、密码,userName="admin" password="admin"-->
    <amq:connectionFactory id="amqConnectionFactory" brokerURL="tcp://10.10.5.223:61616" />

    <!-- Spring Caching连接工厂 -->
    <!-- Spring用于管理真正的ConnectionFactory的ConnectionFactory -->  
    <bean id="connectionFactory" class="org.springframework.jms.connection.CachingConnectionFactory">
        <!-- 目标ConnectionFactory对应真实的可以产生JMS Connection的ConnectionFactory -->  
        <property name="targetConnectionFactory" ref="pooledConnectionFactory"></property>
        <!-- 同上，同理 -->
        <!-- <constructor-arg ref="amqConnectionFactory" /> -->
        <!-- Session缓存数量 -->
        <property name="sessionCacheSize" value="100" />
    </bean>

    <!-- Spring JmsTemplate 的消息生产者 start-->

    <!-- 定义JmsTemplate的Queue类型 -->
    <bean id="jmsQueueTemplate" class="org.springframework.jms.core.JmsTemplate">
        <!-- 这个connectionFactory对应的是我们定义的Spring提供的那个ConnectionFactory对象 -->  
        <constructor-arg ref="connectionFactory" />
        <!-- 非pub/sub模型（发布/订阅），即队列模式 -->
        <property name="pubSubDomain" value="false" />
        <!--
        <property name="defaultDestination" ref="destination" />
                    超时时间，不设置将进入阻塞状态
        <property name="receiveTimeout" value="600" />
        -->
    </bean>

    <!-- 定义JmsTemplate的Topic类型 -->
    <bean id="jmsTopicTemplate" class="org.springframework.jms.core.JmsTemplate">
         <!-- 这个connectionFactory对应的是我们定义的Spring提供的那个ConnectionFactory对象 -->  
        <constructor-arg ref="connectionFactory" />
        <!-- pub/sub模型（发布/订阅） -->
        <property name="pubSubDomain" value="true" />
    </bean>
    <!--Spring JmsTemplate 的消息生产者 end-->


    <!-- 消息消费者 start-->

    <!-- 定义Queue监听器 -->
    <jms:listener-container destination-type="queue" container-type="default" connection-factory="connectionFactory" acknowledge="auto">
        <jms:listener destination="test.queue.string" ref="queueReceiver"/>
        <jms:listener destination="test.queue.map" ref="queueMapReceiver"/>
        <jms:listener destination="test.queue.object" ref="queueObjectReceiver"/>
    </jms:listener-container>

    <!-- 定义Topic监听器 -->
    <jms:listener-container destination-type="topic" container-type="default" connection-factory="connectionFactory" acknowledge="auto">
        <jms:listener destination="test.topic" ref="topicReceiver"/>
    </jms:listener-container>

    <!-- 消息消费者 end -->

</beans>  
```

消息发送

```java
package me.lingfeng.core.mq.producer.queue;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.springframework.stereotype.Component;

/**
 *
 * @author 凌风
 * @description 队列消息生产者，发送消息到队列
 *
 */
@Component("queueSender")
public class QueueSender {

	@Autowired
	@Qualifier("jmsQueueTemplate")
	private JmsTemplate jmsTemplate;// 通过@Qualifier修饰符来注入对应的bean

	/**
	 * 发送一条消息到指定的队列（目标）
	 *
	 * @param queueName 队列名称
	 * @param message 消息内容
	 */
	public void send(String queueName, final String message) {
		jmsTemplate.send(queueName, new MessageCreator() {
			@Override
			public Message createMessage(Session session) throws JMSException {
				return session.createTextMessage(message);
			}
		});
	}

	/**
	 *
	 * 发送一条消息到指定的队列（目标）
	 *
	 * @param queueName 队列名称
	 * @param message 消息内容
	 */
	public void send(String queueName, final Object message) {
		jmsTemplate.send(queueName, new MessageCreator() {
			@Override
			public Message createMessage(Session session) throws JMSException {
				return jmsTemplate.getMessageConverter().toMessage(message, session);
			}
		});
	}

}

```

```java
package me.lingfeng.core.mq.producer.topic;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.springframework.stereotype.Component;

/**
 *
 * @author 凌风
 * @description Topic生产者发送消息到Topic
 *
 */

@Component("topicSender")
public class TopicSender {

	@Autowired
	@Qualifier("jmsTopicTemplate")
	private JmsTemplate jmsTemplate;

	/**
	 * 发送一条消息到指定的队列（目标）
	 *
	 * @param queueName
	 *            队列名称
	 * @param message
	 *            消息内容
	 */
	public void send(String topicName, final String message) {
		jmsTemplate.send(topicName, new MessageCreator() {
			@Override
			public Message createMessage(Session session) throws JMSException {
				return session.createTextMessage(message);
			}
		});
	}

}

```

消息消费

```java
```

```java
```


参考资料：
http://blog.csdn.net/jiuqiyuliang/article/details/48758203
http://blog.csdn.net/lifetragedy/article/details/51836557#t15
