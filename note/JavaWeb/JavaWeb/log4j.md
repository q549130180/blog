
## log4j与commons-logging，slf4j的关系

### commons-logging

common-logging是apache提供的一个通用的日志接口。用户可以自由选择第三方的日志组件作为具体实现，像log4j，或者jdk自带的logging， common-logging会通过动态查找的机制，在程序运行时自动找出真正使用的日志库。当然，common-logging内部有一个Simple logger的简单实现，但是功能很弱。所以使用common-logging，通常都是配合着log4j来使用。使用它的好处就是，代码依赖是common-logging而非log4j， 避免了和具体的日志方案直接耦合，在有必要时，可以更改日志实现的第三方库。

JCL+Log4J组合使用模式（即commons-logging+log4j）：

1. commons-logging-1.1.jar
2. log4j-1.2.15.jar
3. log4j.properties

JCL+log4j:

```java
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
private static Log log = LogFactory.getLog(xx.class);
```

### log4j

slf4j全称为Simple Logging Facade for JAVA，java简单日志门面。类似于Apache Common-Logging，是对不同日志框架提供的一个门面封装，可以在部署的时候不修改任何配置即可接入一种日志实现方案。但是，他在编译时静态绑定真正的Log库。使用SLF4J时，如果你需要使用某一种日志实现，那么你必须选择正确的SLF4J的jar包的集合（各种桥接包）。

slf4j+log4j组合使用模式：

1. slf4j-api-1.5.11.jar
2. slf4j-log4j12-1.5.11.jar
3. log4j-1.2.15.jar
4. log4j.properties(也可以是 log4j.xml)

slf4j+log4j：

```java
import  org.slf4j.Logger;
import  org.slf4j.LoggerFactory;
Logger logger = LoggerFactory.getLogger(xx.class);
```



log4j：

```java
import org.apache.log4j.Logger;
Logger logger= Logger.getLogger(xx.class);
```

总结

总的来说，slf4j与commons-logging只是一个日志门面，实际还是要依赖真正的日志库log4j，虽然slf4j和commons-loggins自带了日志库，但是毕竟log4j才是最强大的。



## log4j.properties配置详解与实例

```


```
