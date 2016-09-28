修改tomcat的启动脚本startup.bat。
复制startup.bat为startup-debug.bat，
然后打开startup-debug.bat，
找到call "%EXECUTABLE%" start %CMD_LINE_ARGS%这一行，修改为“call "%EXECUTABLE%" jpda start %CMD_LINE_ARGS%”，然后在上面添加三行：
set JPDA_TRANSPORT=dt_socket
set JPDA_ADDRESS=9000
set JPDA_SUSPEND=n







http://blog.csdn.net/afgasdg/article/details/9236877

http://flyer2010.iteye.com/blog/658506


http://jingyan.baidu.com/article/0320e2c1f4ef6b1b87507b06.html
