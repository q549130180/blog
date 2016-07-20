



修改`http.conf`,在文件末尾加入以下内容

```apache
LoadModule jk_module modules/mod_jk.so
Include /snow/apachehttpd/conf/mod_jk.conf
```

### 5.Tomcat安装与配置

```bash
tar -zxvf apache-tomcat-7.0.65.tar.gz
cd apache-tomcat-7.0.65/

# 安装tomcat-native（不用单独下载，在tomcat的bin目录中自带）

cd bin/
tar -zxvf tomcat-native.tar.gz
cd tomcat-native-1.1.33-src/jni/native/
./configure                                         \
      --with-apr=/snwo/apr/bin/apr-1-config    \
      --with-ssl                                    \
      --with-java-home=/snwo/jdk1.7.0_79

make && make install
```

tomcat默认参数是为开发环境制定，而非适合生产环境，尤其是内存和线程的配置，默认都很低，容易成为性能瓶颈。下面是一些配置示例，需要根据实际需要更改。

```
vim bin/setenv.sh


JAVA_OPTS="-XX:PermSize=128M -XX:MaxPermSize=256M -Xms1536M -Xmx2048M -verbosegc "
CATALINA_OPTS="-Dcom.sun.management.jmxremote.port=7091 -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.authenticate=false -Djava.rmi.server.hostname=192.168.10.100"
JAVA_HOME="/snwo/jdk1.7.0_79"
CATALINA_OPTS="$CATALINA_OPTS -Djava.library.path=/snwo/apr/lib"

chmod 755 bin/setenv.sh

```

bin目录下新建的可执行文件setenv.sh会由tomcat自动调用。上面的jmxremote.authenticate在正式环境中请务必设为true并设置用户名/密码，减少安全隐患，或者注释掉CATALINA_OPTS。（有时候出于性能调优的目的，才需要设置JMX）。对于具体的连接协议有不同的优化属性，参考如下：

对HTTP：

```xml
<Connector port="8080"
           protocol="org.apache.coyote.http11.Http11NioProtocol"
           URIEncoding="UTF-8"
           enableLookups="false"

           maxThreads="400"
           minSpareTheads="50"   
           acceptCount="400"
           acceptorThreadCount="2"              
           connectionTimeout="30000"
           disableUploadTimeout="true"

           compression="on"
           compressionMinSize="2048"
           maxHttpHeaderSize="16384"
           redirectPort="8443"
 />
```

对AJP：

```xml
<Connector port="8009"
           protocol="AJP/1.3"
           maxThreads="300"
           minSpareThreads="50"
           connectionTimeout="30000"
           keepAliveTimeout="30000"
           acceptCount="200"
           URIEncoding="UTF-8"
           enableLookups="false"
           redirectPort="8443" />
```


修改Tomcat的`conf/server.xml`文件中的AJP连接器的端口，确保它们和`workers.properties`文件中的配置对应。此外，在使用了loadbalancer后，要求`worker`的名字和Tomcat的`server.xml`文件中的`<Engine>`元素的`jvmRoute`属性一致

Tomcat修改如下：

```xml
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />

    <!-- Define an AJP 1.3 Connector on port 8009 -->
    <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />

    <Engine name="Catalina" defaultHost="localhost" jvmRoute="worker1" >

```

```xml
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />

    <!-- Define an AJP 1.3 Connector on port 8009 -->
    <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />

    <Engine name="Catalina" defaultHost="localhost" jvmRoute="worker2" >

```


测试页面

最后编辑Tomcat的配置文件server.xml，在HOST段中加入：

```xml

<Context path="" docBase="/apps/testapp/TEST" debug="0" reloadable="true" crossContext="true"/>

```

在`/apps/testapp/TEST`下建立一个`index.jsp`，启动Apache和Tomcat，用浏览器访问`http://localhost:80/`，应该可以看到正确的页面了。

index.jsp内容如下：

```java
<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*" %>
<html><head><title>Cluster App Test</title></head>
<body>
Server Info:
<%
out.println(request.getLocalAddr() + " : " + request.getLocalPort()+"<br>");%>
<%
  out.println("<br> ID " + session.getId()+"<br>");
  // 如果有新的 Session 属性设置
  String dataName = request.getParameter("dataName");
  if (dataName != null && dataName.length() > 0) {
     String dataValue = request.getParameter("dataValue");
     session.setAttribute(dataName, dataValue);
  }
  out.println("<b>Session 列表</b><br>");
  System.out.println("============================");
  Enumeration e = session.getAttributeNames();
  while (e.hasMoreElements()) {
     String name = (String)e.nextElement();
     String value = session.getAttribute(name).toString();
     out.println( name + " = " + value+"<br>");
         System.out.println( name + " = " + value);
   }
%>
  <form action="test.jsp" method="POST">
    CRM <br>
    名称:<input type=text size=20 name="dataName">
     <br>
    值:<input type=text size=20 name="dataValue">
     <br>
    <input type=submit>
   </form>
</body>
</html>
```





<div class="elementHide" >
tomcat集群管理器

```xml
<Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster" channelSendOptions="8">
<Manager className="org.apache.catalina.ha.session.DeltaManager"
	expireSessionsOnShutdown="false"
	notifyListenersOnReplication="true"/>
<Channel className="org.apache.catalina.tribes.group.GroupChannel">
	<Membership className="org.apache.catalina.tribes.membership.McastService"
		bind="127.0.0.1"
		address="228.0.0.4"
		port="45564"
		frequency="500"
		dropTime="3000"/>
	<Receiver className="org.apache.catalina.tribes.transport.nio.NioReceiver"
		address="auto"
		port="4000"
		autoBind="100"
		selectorTimeout="5000"
		maxThreads="6"/>
	<Sender className="org.apache.catalina.tribes.transport.ReplicationTransmitter">
		<Transport className="org.apache.catalina.tribes.transport.nio.PooledParallelSender"/>
	</Sender>
	<Interceptor className="org.apache.catalina.tribes.group.interceptors.TcpFailureDetector"/>
	<Interceptor className="org.apache.catalina.tribes.group.interceptors.MessageDispatch15Interceptor"/>
</Channel>
<Valve className="org.apache.catalina.ha.tcp.ReplicationValve" filter=""/>
<Valve className="org.apache.catalina.ha.session.JvmRouteBinderValve"/>

<Deployer className="org.apache.catalina.ha.deploy.FarmWarDeployer"
	tempDir="/tmp/war-temp"
	deployDir="/tmp/war-deploy"
	watchDir="/tmp/war-listen"
	watchEnabled="false"/>
<ClusterListener
	className="org.apache.catalina.ha.session.JvmRouteSessionIDBinderListener"/>
<ClusterListener
	className="org.apache.catalina.ha.session.ClusterSessionListener"/>

</Cluster>


```
</div>
