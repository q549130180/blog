---
layout: post
title:  Java 8 Lambda表达式
description: "Lambda 是一个匿名函数，我们可以把 Lambda 表达式理解为是一段可以传递的代码（将代码像数据一样进行传递）。可以写出更简洁、更灵活的代码。作为一种更紧凑的代码风格，使 Java 的语言表达能力得到了提升。"
modified: 2018-12-13 16:20:20
tags: [Java,Lambda,Java 8]
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

Lambda 是一个匿名函数，我们可以把 Lambda 表达式理解为是一段可以传递的代码（将代码像数据一样进行传递）。可以写出更简洁、更灵活的代码。作为一种更紧凑的代码风格，使 Java 的语言表达能力得到了提升。


### 1.2 为什么要使用 Lambda 表达式

#### 1. 实例

比如说我们要为 TreeSet 添加一个比价器，如果用原来的匿名内部类实现如下

```
@Test
public void test1() {
    Comparator<Integer> com = new Comparator<Integer>() {
        @Override
        public int compare(Integer o1, Integer o2) {
            return Integer.compare(o1, o2);
        }
    };

    TreeSet<Integer> ts = new TreeSet<>(com);

    TreeSet<Integer> ts2 = new TreeSet<>(new Comparator<Integer>() {
        @Override
        public int compare(Integer o1, Integer o2) {
            return Integer.compare(o1, o2);
        }
    });

    ts2.addAll(Arrays.asList(4, 5, 7, 3, 2, 1, 8, 6, 9));
    System.out.println(ts2.toString());
}
```

Lambda 表达式实现如下

```java
@Test
public void test2() {
    Comparator<Integer> com = (x, y) -> Integer.compare(x, y);
    TreeSet<Integer> ts = new TreeSet<>(com);
    ts.addAll(Arrays.asList(4, 5, 7, 3, 2, 1, 8, 6, 9));
    System.out.println(ts.toString());
}
```

#### 2. 实例

对一个 List 里面的对象进行操作

实体类

```java
public class Employee implements Serializable {

    private int id;
    private String name;
    private int age;
    private double salary;
    
    // 省略 getter 和 setter 方法
}
```

基础数据

```java
List<Employee> emps = Arrays.asList(
        new Employee(1, "张三", 18, 9999.99),
        new Employee(2, "李四", 59, 6666.66),
        new Employee(3, "王五", 28, 3333.33),
        new Employee(4, "赵六", 8, 7777.77),
        new Employee(5, "田七", 38, 5555.55)
);
```

##### 普通实现

我们有两个需求，一个是“获取公司中年龄小于 35 的员工信息”，一个是“获取公司中工资大于 5000 的员工信息”

```java
/**
 * 需求：获取公司中年龄小于 35 的员工信息
 *
 * @param emps
 * @return
 */
public List<Employee> filterEmployeeAge(List<Employee> emps) {
    List<Employee> list = new ArrayList<>();
    for (Employee emp : emps) {
        if (emp.getAge() <= 35) {
            list.add(emp);
        }
    }
    return list;
}

@Test
public void test3() {
    List<Employee> list = filterEmployeeAge(emps);

    for (Employee employee : list) {
        System.out.println(employee);
    }
}

/**
 * 需求：获取公司中工资大于 5000 的员工信息
 *
 * @param emps
 * @return
 */
public List<Employee> filterEmployeeSalary(List<Employee> emps) {
    List<Employee> list = new ArrayList<>();
    for (Employee emp : emps) {
        if (emp.getSalary() >= 5000) {
            list.add(emp);
        }
    }
    return list;
}
```

这样的话我要神队每个需求都写个方法，如果再增加需求，还需要再写


##### 优化方式一：策略设计模式

定义一个接口

```java
public interface MyPredicate<T> {

	public boolean test(T t);
	
}
```

```java
/**
 * 策略设计模式
 *
 * @param emps
 * @param mp
 * @return
 */
public List<Employee> filterEmployee(List<Employee> emps, MyPredicate<Employee> mp) {
    List<Employee> list = new ArrayList<>();
    for (Employee employee : emps) {
        if (mp.test(employee)) {
            list.add(employee);
        }
    }
    return list;
}

/**
 * 根据不同的需求实现不同的策略
 */
@Test
public void test4() {
    List<Employee> list = filterEmployee(emps, new FilterEmployeeForAge());
    for (Employee employee : list) {
        System.out.println(employee);
    }

    System.out.println("---------------------------------------");

    List<Employee> list2 = filterEmployee(emps, new FilterEmployeeForSalary());
    for (Employee employee : list2) {
        System.out.println(employee);
    }
}
```

##### 优化方式二：匿名内部类

```java
/**
 * 匿名内部类
 */
@Test
public void test5() {
    List<Employee> list = filterEmployee(emps, new MyPredicate<Employee>() {
        @Override
        public boolean test(Employee t) {
            return t.getId() <= 103;
        }
    });

    for (Employee employee : list) {
        System.out.println(employee);
    }
}
```

##### 优化方式三：Lambda 表达式

```
/**
 * Lambda 表达式
 */
@Test
public void test6() {
    List<Employee> list = filterEmployee(emps, (e) -> e.getAge() <= 35);
    list.forEach(System.out::println);

    System.out.println("------------------------------------------");

    List<Employee> list2 = filterEmployee(emps, (e) -> e.getSalary() >= 5000);
    list2.forEach(System.out::println);
}
```

##### 优化方式四：Stream API

```java
/**
 * Stream API
 */
@Test
public void test7() {
    emps.stream()
            .filter((e) -> e.getAge() <= 35)
            .forEach(System.out::println);

    System.out.println("----------------------------------------------");

    emps.stream()
            .map(Employee::getName)
            .limit(3)
            .sorted()
            .forEach(System.out::println);
}
```

## 2. Lambda 表达式的基础语法

1. Java8 中引入了一个新的操作符 `->` 该操作符称为箭头操作符或 Lambda 操作符，箭头操作符将 Lambda 表达式拆分成两部分：
   - 左侧：Lambda 表达式的参数列表（即接口抽象方法的参数列表）
   - 右侧：Lambda 表达式中所需执行的功能， 即 Lambda 体（即接口的实现）
2. Lambda 表达式需要“函数式接口”的支持
   - 函数式接口：接口中只有一个抽象方法的接口，称为函数式接口。可以使用注解 `@FunctionalInterface` 修饰，可以检查是否是函数式接口
   - 函数式接口可以有默认方法和静态方法。
   - 任何满足单一抽象方法法则的接口，都会被自动视为函数接口。这包括 Runnable 和 Callable 等传统接口，以及您自己构建的自定义接口。


### 2.1 无参数，无返回值

```java
() -> System.out.println("Hello Lambda!");
```

#### 1. 实例

```java
@Test
public void t1(){
    Runnable r1 = () -> System.out.println("Hello Lambda!");
    r1.run();
}
```

### 2.2 有一个参数，并且无返回值

```
(x) -> System.out.println(x)
```

#### 1. 实例

```java
@Test
public void t2(){
    Consumer<String> con = (x) -> System.out.println(x);
    con.accept("Hello Lambda!");
}
```

#### 2. 实例

如果只有一个参数的情况下小括号是可以省略的

```java
@Test
public void t3(){
    Consumer<String> con = x -> System.out.println(x);
    con.accept("Hello Lambda!");
}
```

### 2.3 有两个以上的参数，有返回值，并且 Lambda 体中有多条语句

#### 1. 实例

```java
@Test
public void t4() {
    Comparator<Integer> com = (x, y) -> {
        System.out.println("函数式接口");
        return Integer.compare(x, y);
    };
}
```

### 2.4 若 Lambda 体中只有一条语句， return 和 大括号都可以省略不写

#### 1. 实例

```java
@Test
public void t5(){
	Comparator<Integer> com = (x, y) -> Integer.compare(x, y);
}
```

Lambda 表达式的参数列表的数据类型可以省略不写，因为JVM编译器通过上下文推断出，数据类型，即“类型推断”，如果写类型的话如下


```java
@Test
public void t6(){
    Comparator<Integer> com = (Integer x,Integer y) -> Integer.compare(x, y);
}
```