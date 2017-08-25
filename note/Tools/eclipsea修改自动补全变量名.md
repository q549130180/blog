---
layout: post
title:  Eclipse修改自动补全变量名
description: "Eclipse修改自动补全变量名，在使用eclipse时，使用所有按键都有提示时，当按空格的时候会自动补全变量名，本教程将eclipse的部分源码进行修改，达到按空格键不会进行自动补全变量名。"
modified: 2017-07-27 15:20:20
tags: [Eclipse]
post_type: developer
series: 工欲善其事，必先利其器
categories: [Eclipse]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---
前言

在使用eclipse时，使用所有按键都有提示时，当按空格的时候会自动补全变量名，本教程将eclipse的部分源码进行修改，达到按空格键不会进行自动补全变量名

1.查看eclipse版本，Help->About Eclipse ,查看version的版本

2.下载相应的eclipse源码版本，下载地址：http://archive.eclipse.org/eclipse/downloads/

3。先找到相关的插件： window -> show view -> plug-ins
找到插件org.eclipse.jface.text,右键点击,选择import as Source Project,导入完成后,在你的workspace就可以看到这个project了
4.修改代码
在src/org/eclipse/jface/text/contentassist/CompletionProposalPopup.java文件中,找到这样一行代码

```java
char[] triggers = t.getTriggerCharacter();
if(contains(triggers,key))
```

在那行if判断里面,eclipse会判断key(就是你按下的键)是否在triggers中,如果是,那就触发下面的第一行提示上屏的代码.所以我们要做的就是把空格和=号排除就可以了:

```java
if(key != '=' && key != 0x20 &&contains(triggers,key)){
    .........
}
```

代码修改成这样后，提示的时候按下空格或者等号，提示就会没掉，也不会自动补全了咯！！！

3.把修改好的org.eclipse.jface.text导出

右键点击你的workspace里的org.eclipse.jface.text,选择export-->Deployable plugins and fragments, next,destination 选择archive file，然后finish.你就可以在zip文件里看到生成好的jar ,用它替换掉eclipse/plugins里面的同名jar包,就可以了。

注意：MyEclipse无法导入插件的源码工程，可以下载对应版本的Eclipse，重新编译得到插件后再覆盖MyEclipse里的插件即可。
