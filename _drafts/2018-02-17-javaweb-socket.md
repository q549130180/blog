---
layout: post
title:  JavaWeb项目中使用Socket通信多线程、长连接进行文件传输
description: "。"
modified: 2018-02-07 15:20:20
tags: [java,javaweb,socket]
post_type: developer
categories: [java]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 简介

很多时候在javaweb项目中我们需要用到Socket通信来实现功能，在web中使用Socket我们需要建立一个监听程序，在程序启动时，启动socket监听。我们的应用场景是使用socket进行文件传输。

## 2. 代码实现

Web的监听代码：

```java
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class AttendSocetListener  implements ServletContextListener{
    private SocketThread socketThread;
    public void contextDestroyed(ServletContextEvent arg0) {  
        if(null!=socketThread && !socketThread.isInterrupted())  
           {  
            socketThread.closeSocketServer();  
            socketThread.interrupt();  
           }  
    }  

    @Override
    public void contextInitialized(ServletContextEvent arg0) {  
        // TODO Auto-generated method stub  
        if(null==socketThread)  
        {  
         //新建线程类  
         socketThread=new SocketThread(null);  
         //启动线程  
         socketThread.start();  
        }  
    }   
}
```

创建线程：

```java
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class SocketThread extends Thread {

	private ServerSocket serverSocket = null;

	private static final int SERVER_PORT = 12345; // 服务端端口  

	public SocketThread(ServerSocket serverScoket) {
		try {
			if (null == serverSocket) {
				this.serverSocket = new ServerSocket(SERVER_PORT);
				System.out.println("socket start");
			}
		} catch (Exception e) {
			System.out.println("SocketThread创建socket服务出错");
			e.printStackTrace();
		}
	}

	public void run() {
		while (true) {
			try {
				if (serverSocket == null) {
					break;
				} else if (serverSocket.isClosed()) {
					break;
				}
				System.out.println("开始监听...");
				Socket socket = serverSocket.accept();
				if (null != socket && !socket.isClosed()) {
					// 处理接受的数据
					Thread t = new Thread(new SocketOperate(socket));
					t.start();
				} else {
					break;
				}
			} catch (Exception e) {
				System.out.println("SocketThread创建socket服务出错");
				e.printStackTrace();
			}
		}
	}

	public void closeSocketServer() {
		try {
			if (null != serverSocket && !serverSocket.isClosed()) {
				serverSocket.close();
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}

```

处理接受到的数据：

```java
import java.io.DataInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.text.SimpleDateFormat;
import java.util.Date;

public class SocketOperate implements Runnable {

	private Socket socket;

	private static final String BASE_FILE_PATH = "/Downloads/";// 文件存储基础路劲

	byte[] inputByte = null;
	int length = 0;
	DataInputStream dis = null;
	FileOutputStream fos = null;
	String filePath = null;

	public SocketOperate(Socket socket) throws IOException {
		this.socket = socket;

		// 获取socket输入流
		dis = new DataInputStream(socket.getInputStream());

		// 文件名和长度
		String fileName = dis.readUTF();
		long fileLength = dis.readLong();

		SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		filePath = BASE_FILE_PATH + df.format(new Date()) + "-" + fileName;

		/*
		 * 文件存储位置
		 */
		fos = new FileOutputStream(new File(filePath));
	}

	@Override
	public void run() {
		try {
			inputByte = new byte[1024];
			System.out.println("开始接收数据...");
			while ((length = dis.read(inputByte, 0, inputByte.length)) > 0) {
				fos.write(inputByte, 0, length);
				fos.flush();
			}
			System.out.println("完成接收：" + filePath);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
```

客户端代码：

```java
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.text.DecimalFormat;

/**
 * 文件发送客户端主程序
 *
 * @author admin_Hzw
 *
 */
public class SocketClient {

	private static final String SERVER_IP = "127.0.0.1"; // 服务端IP  

    private static final int SERVER_PORT = 12345; // 服务端端口  

    public static void sendFile(String fileName) throws IOException {
    int length = 0;
		double sumL = 0;
		byte[] sendBytes = null;
		Socket socket = null;
		DataOutputStream dos = null;
		FileInputStream fis = null;
		boolean bool = false;
		long startTime = System.currentTimeMillis();
		try {
			//读取要发送的文件
			File file = new File(fileName); // 要传输的文件路径
			long l = file.length();//文件大小
			socket = new Socket();
			socket.connect(new InetSocketAddress(SERVER_IP, SERVER_PORT));
			//获取输出流
			dos = new DataOutputStream(socket.getOutputStream());

      // 文件名和长度  
      dos.writeUTF(file.getName());  
      dos.flush();  
      dos.writeLong(file.length());  
      dos.flush();  

			fis = new FileInputStream(file);
			sendBytes = new byte[1024];
			//格式化double
			DecimalFormat df = new DecimalFormat("#.00");
			// 开始传输文件  
            System.out.println("======== 开始传输文件 ========");  
			while ((length = fis.read(sendBytes, 0, sendBytes.length)) > 0) {
				sumL += length;
				System.out.println("已传输：" + df.format(((sumL / l) * 100)) + "%");
				dos.write(sendBytes, 0, length);
				dos.flush();
			}
			// 虽然数据类型不同，但JAVA会自动转换成相同数据类型后在做比较
			if (sumL == l) {
				bool = true;
			}
		} catch (Exception e) {
			System.out.println("客户端文件传输异常");
			bool = false;
			e.printStackTrace();
		} finally {
			if (dos != null)
				dos.close();
			if (fis != null)
				fis.close();
			if (socket != null)
				socket.close();
		}

		long endTime = System.currentTimeMillis();  
		//计算传输时间
		float seconds = (endTime - startTime) / 1000F;  
        System.out.println(bool ? "传输时间:" + Float.toString(seconds) + " 秒.":"");
		System.out.println(bool ? "成功" : "失败");
    }

	/**
	 * 程序main方法
	 *
	 * @param args
	 * @throws IOException
	 */
	public static void main(String[] args) throws IOException {
		String fileName = "/Users/ling/Downloads/sc_sql_2000a_ent.iso";
		SocketClient.sendFile(fileName);
	}
}
```


参考资料
http://www.cnblogs.com/forget406/p/5336748.html
