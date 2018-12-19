---
layout: post
title:  Java 8 重复注解与类型注解
description: "Java 8 对注解处理提供了两点改进，可重复的注解及可用于类型的注解。"
modified: 2018-12-21 18:20:20
tags: [Java,Lambda,Java 8]
post_type: developer
series: Java 8 系列文章
categories: [Java]
image:
  feature: posts_header/abstract-5.jpg
  credit:
  creditlink:
---

## 1. 概述

### 1.2 简介

Java 8 对注解处理提供了两点改进，可重复的注解及可用于类型的注解


## 2. 重复注解

要想定义重复注解，必须给它定义的容器类，还要使用 `@Repeatable` 注解修饰一下

```java
@Repeatable(RepetitionAnnotations.class)
@Target({TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RepetitionAnnotation {

    String value() default "ling";

}
```

```java
/**
 * 容器类
 */
@Target({TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RepetitionAnnotations {

    RepetitionAnnotation[] value();

}
```

测试方法

```java
public class AnnotationTest {

    @Test
    public void t1() throws Exception {
        Class<AnnotationTest> clazz = AnnotationTest.class;
        Method method = clazz.getMethod("show");

        // 获取方法上的注解
        RepetitionAnnotation[] ras = method.getAnnotationsByType(RepetitionAnnotation.class);

        for (RepetitionAnnotation repetitionAnnotation : ras) {
            System.out.println(repetitionAnnotation.value());
        }

    }

    @RepetitionAnnotation("Hello")
    @RepetitionAnnotation("World")
    public void show() {

    }
}
```


## 3. 类型注解

就是向 `@Target` 添加一种类型 `TYPE_PARAMETER`

```java
@Repeatable(RepetitionAnnotations.class)
@Target({TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE,TYPE_PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface RepetitionAnnotation {

    String value() default "ling";

}
```

使用

```java
@RepetitionAnnotation("Hello")
@RepetitionAnnotation("World")
public void show(@RepetitionAnnotation String str) {

}
```