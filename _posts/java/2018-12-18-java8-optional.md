---
layout: post
title:  Java 8 新特性之Optional类
description: "Optional<T> 类（java.util.Optional）是一个容器类，代表一个值存在或不存在，原来用 null 表示一个值不存在，现在 Optional 可以更好的表达这个概念，并且可以避免空指针异常。"
modified: 2018-12-18 16:20:20
tags: [Java,Lambda,Java 8,Optional]
post_type: developer
series: Java 8 系列文章
categories: [Java]
image:
  feature: posts_header/abstract-11.jpg
  credit:
  creditlink:
---


## 1. 概述

### 1.1 简介

`Optional<T>` 类（java.util.Optional）是一个容器类，代表一个值存在或不存在，原来用 null 表示一个值不存在，现在 Optional 可以更好的表达这个概念，并且可以避免空指针异常。

**Optional 容器类的常用方法**
- `of(T t)` 创建一个 Optional 实例
- `get()` 获取容器中的对象
- `empty()` 创建一个空的 Optional 实例
- `ofNullable(T t)` 若 t 不为 null，创建 Optional 实例，否则创建空实例
- `isPresent()` 判断是否包含值
- `orElse(T t)` 如果调用对象包含值，返回该值，否则返回 t
- `orElseGet(Supplier s)` 如果调用对象包含值，返回该值，否则返回 s 获取的值
- `map(Function f)` 如果有值对其处理，并返回处理后的 Optional。否则返回 `Optional.empty()`
- `flatMap(Function mapper)` 与 map 类似，要求返回值必须是 Optional


## 2. Optional 容器类的常用方法

### 2.1 `of(T t)` 创建一个 Optional 实例


```java
@Test
public void t1() {
    Optional<String> op = Optional.of(new String("ling"));
    String emp = op.get();
    System.out.println(emp);
}
```

### 2.2 `empty()` 创建一个空的 Optional 实例


```java
@Test
public void t2() {
    Optional<String> op = Optional.empty();
    System.out.println(op.get());
}
```

当创建一个空的 Optional 容器时，再使用 get() 方法会报获取不到值的异常 `java.util.NoSuchElementException: No value present`

### 2.3 `ofNullable(T t)` 若 t 不为 null，创建 Optional 实例，否则创建空实例

```java
@Test
public void t3() {
    Optional<String> op = Optional.ofNullable(null);
    System.out.println(op.get());
}
```

ofNullable 在使用 null 创建容器的时候，同样会抛出 `java.util.NoSuchElementException: No value present` 异常

### 2.4 `isPresent()` 判断是否包含值

```java
@Test
public void t4() {
    Optional<String> op = Optional.ofNullable(new String("ling"));
    // 有值就获取，没值就什么都不做
    if (op.isPresent()) {
        System.out.println(op.get());
    }
}
```

### 2.5 `orElse(T t)` 如果调用对象包含值，返回该值，否则返回 t

```java
@Test
public void t5() {
    Optional<String> op = Optional.ofNullable(null);
    String str = op.orElse("feng");
    System.out.println(str);
}
```

### 2.6 `orElseGet(Supplier s)` 如果调用对象包含值，返回该值，否则返回 s 获取的值
```java
@Test
public void t6() {
    Optional<String> op = Optional.ofNullable(null);
    String str = op.orElseGet(() -> new String("feng"));
    System.out.println(str);
}
```


### 2.7 `map(Function f)` 如果有值对其处理，并返回处理后的 Optional。否则返回 `Optional.empty()`

```java
@Test
public void t8() {
    Optional<String> op = Optional.ofNullable("lingfeng");
    Optional<Integer> len = op.map((s) -> s.length());
    System.out.println("字符串长度为 : " + len.get());
}
```

### 2.8 `flatMap(Function mapper)` 与 map 类似，要求返回值必须是 Optional

```java
@Test
public void t9() {
    Optional<String> op = Optional.ofNullable("lingfeng");
    Optional<Integer> len = op.flatMap((s) -> Optional.of(s.length()));
    System.out.println("字符串长度为 : " + len.get());
}
```