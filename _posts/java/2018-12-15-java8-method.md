---
layout: post
title:  Java 8 方法引用
description: "若 Lambda 体中的功能，已经有方法提供了实现，可以使用方法引用（可以将方法引用理解为 Lambda 表达式的另外一种表现形式）"
modified: 2018-12-15 18:20:20
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

### 1.1 简介

若 Lambda **体中**的功能，已经有方法提供了实现，可以使用方法引用（可以将方法引用理解为 Lambda 表达式的另外一种表现形式）

方法引用的三种形式
1. 对象的引用::实例方法名
2. 类名::静态方法名
3. 类名::实例方法名

> 注意：
> - ①方法引用所引用的方法的参数列表与返回值类型，需要与函数式接口中抽象方法的参数列表和返回值类型保持一致！
> - ②若 Lambda 的参数列表的第一个参数，是实例方法的调用者，第二个参数(或无参)是实例方法的参数时，格式： ClassName::MethodName

## 2. 方法引用

### 2.2 对象的引用::实例方法名


```java
public class Employee implements Serializable {

    private int id;
    private String name;
    private int age;
    private double salary;

    public Employee() {
    }

    public Employee(String name) {
        this.name = name;
    }

    public Employee(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public Employee(int id, String name, int age, double salary) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.salary = salary;
    }
    
    // 省略 getter 和 setter 方法
}
```
```java
@Test
public void t1() {
    // lambda 表达式方式
    PrintStream printStreamLamBda = System.out;
    Consumer<String> consumerLambda = (x) -> printStreamLamBda.println(x);
    consumerLambda.accept("hello lambda");

    // 方法引用方式
    PrintStream printStream = System.out;
    // 使用方法引用前提是 Consumer 的 accept 方法的参数列表和返回值必须与 println 方法的参数列表和返回值一致(参考注意①)
    Consumer<String> con = printStream::println;
    con.accept("hello method!");
}

@Test
public void t2(){
    Employee emp = new Employee(100,"ling",18,10000);

    // lambda 表达式方式
    Supplier<String> supplierLambda = () -> emp.getName();
    System.out.println(supplierLambda.get());

    // 方法引用方式
    Supplier<String> supplier = emp::getName;
    System.out.println(supplier.get());
}
```

### 2.3 类名::静态方法名

```java
@Test
public void t3(){
    BiFunction<Double, Double, Double> fun = (x, y) -> Math.max(x, y);
    System.out.println("Lambda : " + fun.apply(1.5, 22.2));

    System.out.println("------------------------------------");

    BiFunction<Double, Double, Double> fun2 = Math::max;
    System.out.println("方法引用 : " + fun2.apply(1.2, 1.5));
}
```

### 2.4 类名::实例方法名


在 `Employee` 中添加方法

```java
public String show() {
    return "测试方法引用！";
}
```

测试方法

```java
@Test
public void test5(){
    BiPredicate<String, String> bp = (x, y) -> x.equals(y);
    System.out.println(bp.test("ling", "ling"));

    System.out.println("------------------------------------");

    BiPredicate<String, String> bp2 = String::equals;
    System.out.println(bp2.test("ling", "ling"));

    System.out.println("------------------------------------");


    Function<Employee, String> fun = (e) -> e.show();
    System.out.println(fun.apply(new Employee()));

    System.out.println("------------------------------------");

    Function<Employee, String> fun2 = Employee::show;
    System.out.println(fun2.apply(new Employee()));
}
```

## 3. 构造器引用

### 3.1 简介

使用构造器引用来创建对象

> 注：被调用的构造器的参数列表，需要与函数式接口中参数列表保持一致！

构造器引用的语法格式
- 类名::new

### 3.2 实例

```java
@Test
public void t5(){
    // Lambda 方式调用无参构造器
    Supplier<Employee> sup = () -> new Employee();
    System.out.println(sup.get());

    System.out.println("------------------------------------");

    // 构造器引用方式调用无参构造器
    Supplier<Employee> sup2 = Employee::new;
    System.out.println(sup2.get());

    // 调用一个参数构造器
    Function<String, Employee> fun = Employee::new;

    // 调用两个个参数构造器
    BiFunction<String, Integer, Employee> fun2 = Employee::new;
}
```

## 4. 数组引用

### 4.1 简介

用于创建数组

语法格式
- 类型[]::new;

### 4.2 实例

```java
@Test
public void t6() {
    // Lambda 方式
    Function<Integer, String[]> funLambda = (args) -> new String[args];
    String[] strsLambda = funLambda.apply(50);
    System.out.println("Lambda : " + strsLambda.length);

    System.out.println("------------------------------------");

    // 数组引用方式
    Function<Integer,String[]> func = String[]::new;
    String[] strArr = func.apply(100);
    System.out.println("arr  : " + strArr.length);
}

```