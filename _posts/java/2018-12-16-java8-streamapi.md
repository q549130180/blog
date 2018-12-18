---
layout: post
title:  Java 8 Stream API
description: "Java 8 中有两大最为重要的改革，第一个是 Lambda 表达式，另外一个则是 Stream API（java.util.stream.*）。Stream 是 Java 8 中处理集合的关键抽象概念，它可以指定你希望对集合进行的操作，可以执行非常复杂的查找、过滤和映射数据等操作。使用 Stream API 对集合数据进行，就类似于使用 SQL 执行的数据库查询。也可以使用 Stream API 来并行执行操作。简而言之，Stream API 提供了一种高效且易于使用的处理数据的方式。"
modified: 2018-12-16 19:20:20
tags: [Java,Lambda,Java 8,Stream API]
post_type: developer
series: Java 8 系列文章
categories: [Java]
image:
  feature: posts_header/abstract-2.jpg
  credit:
  creditlink:
---


## 1. 概述

### 1.1 简介

Java 8 中有两大最为重要的改革，第一个是 Lambda 表达式，另外一个则是 Stream API（java.util.stream.*）。

Stream 是 Java 8 中处理集合的关键抽象概念，它可以指定你希望对集合进行的操作，可以执行非常复杂的查找、过滤和映射数据等操作。使用 Stream API 对集合数据进行，就类似于使用 SQL 执行的数据库查询。也可以使用 Stream API 来并行执行操作。简而言之，Stream API 提供了一种高效且易于使用的处理数据的方式。


### 1.2 流（Stream）到底是什么呢？

是数据渠道，用于操作数据源（集合、数组等）所生成的元素序列。“集合讲的是数据，流讲的是计算”

Stream（流）是一个来自数据源的元素队列并支持聚合操作

- **元素**是特定类型的对象，形成一个队列。 Java中的Stream并不会存储元素，而是按需计算。
- **数据源** 流的来源。 可以是集合，数组，I/O channel， 产生器generator 等。
- **聚合操作** 类似SQL语句一样的操作， 比如 filter, map, reduce, find, match, sorted 等。

和以前的 Collection 操作不同， Stream 操作还有两个基础的特征：

- **Pipelining**: 中间操作都会返回流对象本身。 这样多个操作可以串联成一个管道， 如同流式风格（fluent style）。 这样做可以对操作进行优化， 比如延迟执行(laziness)和短路( short-circuiting)。
- **内部迭代**： 以前对集合遍历都是通过 Iterator 或者 For-Each 的方式, 显式的在集合外部进行迭代， 这叫做外部迭代。 Stream提供了内部迭代的方式， 通过访问者模式(Visitor)实现。

> 注意 : 
> 1. Stream 自己不会存储元素
> 2. Stream 不会改变源对象，相反，它们会返回一个持有结果的新 Stream
> 3. Stream 操作时延迟执行的。这意味着它们会等到需要结果的时候才执行

### 1.3 Stream 操作的三个步骤

1. 创建 Stream
   - 一个数据源（集合、数组等），获取一个流
2. 中间操作（聚合操作）
   - 一个中间操作链，对数据源的数据进行处理
3. 终止操作（终端操作）
   - 一个终止操作，执行中间操作链，并产生结果

![Java Stream](http://image.huangxubo.me/images/java/java_stream_2018_12_13_001.jpg)


## 2. 创建 Stream（流）

在 Java 8 中, 集合接口有两个方法来生成流：

- stream() − 为集合创建串行流。
- parallelStream() − 为集合创建并行流。

创建 Stream 的 5 种方式

```java
@Test
public void t1() {
    // 1. Collection 提供了两个方法  stream() 与 parallelStream()
    List<String> list = new ArrayList<>();
    Stream<String> stream = list.stream(); //获取一个顺序流
    Stream<String> parallelStream = list.parallelStream(); //获取一个并行流

    // 2. 通过 Arrays 中的 stream() 获取一个数组流
    Integer[] nums = new Integer[10];
    Stream<Integer> stream1 = Arrays.stream(nums);

    // 3. 通过 Stream 类中静态方法 of()
    Stream<Integer> stream2 = Stream.of(1,2,3,4,5,6);

    // 4. 创建无限流 - 迭代
    Stream<Integer> stream3 = Stream.iterate(0, (x) -> x + 2).limit(20);
    stream3.forEach(System.out::println);

    // 5. 创建无限流 - 生成
    Stream<Double> stream4 = Stream.generate(Math::random).limit(5);
    stream4.forEach(System.out::println);
}
```

## 3. Stream 的中间操作

多个中间操作可以连接起来形成一个流水线，除非流水线上触发终止操作，否则中间操作不会执行任何处理，而是在终止操作时一次性全部处理，称为“惰性求值”

提供基础的操作数据

```java
List<Employee> emps = Arrays.asList(
        new Employee(1, "a1", 28, 3888.99),
        new Employee(2, "a2", 49, 336.66),
        new Employee(3, "a3", 18, 3323.33),
        new Employee(4, "a4", 38, 6666.77),
        new Employee(5, "a5", 8, 80.88),
        new Employee(5, "a5", 8, 80.88),
        new Employee(5, "a5", 8, 80.88),
        new Employee(6, "a6", 56, 100.66)
);
```

### 3.1 筛选与切片

- `filter` 接收Lambda，从流中排除某些元素。
- `limit` 截断流，使元素不超过给定数量
- `skip(n)` 跳过元素，返回一个扔掉了前 n 个元素的流，若流中元素不足 n 个，则返回一个空流，与 limit 互补
- `distinct` 筛选去重，通过流所生成元素的 `hashCode()` 和 `equals()` 去除重复元素





#### 1. filter 接收Lambda，从流中排除某些元素


```java
@Test
public void t2() {
    // 中间操作：不会执行任何操作
    Stream<Employee> stream = emps.stream()
            .filter((e) -> {
                System.out.println("中间操作");
                return e.getAge() > 20;
            });

    // 终止操作：一次性执行全部内容，即"惰性求值"
    stream.forEach(System.out::println);

}
```


#### 2. limit 截断流

```java
@Test
public void t3() {
    emps.stream()
            .filter((e) -> {
                // 当达到 limit 为 2 时将不继续遍历，称为短路，以提高效率
                System.out.println("短路");
                return e.getSalary() > 3000;
            })
            .limit(2)
            .forEach(System.out::println);
}
```

#### 3. skip 跳过元素

```java
@Test
public void t4() {
    emps.stream()
            .filter(e -> e.getSalary() > 100)
            .skip(2)
            .forEach(System.out::println);
}
```

#### 4. distinct 筛选

```java
@Test
public void t5() {
    emps.stream()
            .distinct()
            .forEach(System.out::println);
}
```

要使用 `distinct` 需要重写 `Employee` 的 `hashCode()` 和 `equals()` 方法

```java
@Override
public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + age;
    result = prime * result + id;
    result = prime * result + ((name == null) ? 0 : name.hashCode());
    long temp;
    temp = Double.doubleToLongBits(salary);
    result = prime * result + (int) (temp ^ (temp >>> 32));
    return result;
}

@Override
public boolean equals(Object obj) {
    if (this == obj)
        return true;
    if (obj == null)
        return false;
    if (getClass() != obj.getClass())
        return false;
    Employee other = (Employee) obj;
    if (age != other.age)
        return false;
    if (id != other.id)
        return false;
    if (name == null) {
        if (other.name != null)
            return false;
    } else if (!name.equals(other.name))
        return false;
    if (Double.doubleToLongBits(salary) != Double.doubleToLongBits(other.salary))
        return false;
    return true;
}
```

### 3.2 映射

- `map` 接收 Lambda，将元素转换成其它形式或提取信息。接收一个函数作为参数，该函数会被应用到每个元素上，并将其映射成一个新的元素
- `flatMap` 接收一个函数作为参数，将流中的每个值都换成另一个流，然后把所有流连接成一个流


#### 1. map

将原有的元素进过函数处理，让后映射（覆盖）成一个新的元素

```java
@Test
public void t6() {
    List<String> list = Arrays.asList("aa","bb","cc","dd");
    list.stream()
            .map((s) -> s.toUpperCase())
            .forEach(System.out::println);

    System.out.println("------------------------------------");
    
    emps.stream()
            .map(Employee::getName)
            .forEach(System.out::println);
}
```


#### 2. flatMap

基础方法

```java
/**
 * 将字符串分解成字符 list，并返回 Stream
 * 
 * @param str 待分解字符串
 * @return Stream
 */
public static Stream<Character> filterCharacter(String str) {
    List<Character> list = new ArrayList<>();
    for (Character ch : str.toCharArray()) {
        list.add(ch);
    }
    return list.stream();
}
```

正常情况下，当 `filterCharacter` 返回的也是一个 `Stream` 时，相当于流里面还有子流，接收的结果就是 `Stream<Stream<Character>>`，如果我们要进行遍历的话，就需要使用两层 `forEach` 才能遍历完成。

```java
@Test
public void t7() {
    List<String> list = Arrays.asList("aa","bb","cc","dd");
    Stream<Stream<Character>> stream = list.stream()
            .map(StreamTest1::filterCharacter);
    // 因为 Stream 还是 Stream 所以需要嵌套 forEach 才能进行遍历
    stream.forEach((sm) -> {
        sm.forEach(System.out::println);
    });
}
```

但如果使用 `flatMap` 就可以将每个子流都合并成一个流，这样遍历的时候只使用一层 `forEach` 就可以了

```java
@Test
public void t8() {
    List<String> list = Arrays.asList("aa","bb","cc","dd");
    Stream<Character> stream = list.stream()
            .flatMap(StreamTest1::filterCharacter);
    stream.forEach(System.out::println);
}
```

### 3.3 排序

- `sorted` 自然排序（Comparable）
- `sorted(Comparator com)` 定制排序（Comparator）


#### 1. sorted 自然排序

```java
@Test
public void t9() {
    List<String> list = Arrays.asList("cc","aa","dd","bb");
    list.stream()
            .sorted()
            .forEach(System.out::println);
}
```

#### 2. sorted(Comparator com) 定制排序

```java
@Test
public void t10() {
    emps.stream()
            .sorted((e1,e2) -> Integer.compare(e1.getAge(),e2.getAge()))
            .forEach(System.out::println);
}
```

## 4. Stream 终止操作

### 4.1 查找与匹配

- `allMatch` 检查是否匹配所有元素
- `anyMatch` 检查是否至少匹配一个元素
- `noneMatch` 检查是否没有匹配的元素
- `findFirst` 返回第一个元素
- `findAny` 返回当前流中的任意元素
- `count` 返回流中元素的总个数
- `max` 返回流中最大值
- `min` 返回流中最小值

**基础数据**

```java
List<Employee> emps = Arrays.asList(
        new Employee(1, "a1", 28, 3888.99, Employee.Status.BUSY),
        new Employee(2, "a2", 49, 336.66, Employee.Status.FREE),
        new Employee(3, "a3", 18, 3323.33, Employee.Status.VOCATION),
        new Employee(4, "a4", 38, 6666.77, Employee.Status.FREE),
        new Employee(5, "a5", 8, 80.88, Employee.Status.VOCATION),
        new Employee(6, "a6", 56, 100.66, Employee.Status.BUSY)
);
```

#### 1. `allMatch` 检查是否匹配所有元素

```java
@Test
public void t1() {
    boolean bool = emps.stream()
            .allMatch((e) -> e.getStatus().equals(Employee.Status.BUSY));

    System.out.println(bool);
}
```

#### 2. `anyMatch` 检查是否至少匹配一个元素

```java
@Test
public void t2() {
    boolean bool = emps.stream()
            .anyMatch((e) -> e.getStatus().equals(Employee.Status.BUSY));

    System.out.println(bool);
}
```

#### 3. `noneMatch` 检查是否没有匹配的元素

```java
@Test
public void t3() {
    boolean bool = emps.stream()
            .noneMatch((e) -> e.getStatus().equals(Employee.Status.BUSY));

    System.out.println(bool);
}
```

#### 4. `findFirst` 返回第一个元素

```java
@Test
public void t4() {
    Optional<Employee> op = emps.stream()
            .sorted((e1, e2) -> Double.compare(e1.getSalary(), e2.getSalary()))
            .findFirst();

    System.out.println(op.get());
}
```

#### 5. `findAny` 返回当前流中的任意元素

```java
@Test
public void t5() {
    Optional<Employee> op = emps.stream()
            .filter((e) -> e.getStatus().equals(Employee.Status.FREE))
            .findAny();
    System.out.println(op.get());
}
```

#### 6. `count` 返回流中元素的总个数

```java
/**
 * 查询空闲人数
 */
@Test
public void t6() {
    Long count = emps.stream()
            .filter((e) -> e.getStatus().equals(Employee.Status.FREE))
            .count();
    System.out.println("count : " + count);
}
```

#### 7. `max` 返回流中最大值

```java
/**
 * 查询工资最高的人
 */
@Test
public void t7() {
    Optional<Employee> op = emps.stream()
            .max((e1,e2) -> Double.compare(e1.getSalary(),e2.getSalary()));

    System.out.println(op.get());
}

```

#### 8. `min` 返回流中最小值

```java
/**
 * 获取工资最少的人的工资
 */
@Test
public void t8() {
    Optional<Double> op = emps.stream()
            .map(Employee::getSalary)
            .min(Double::compare);

    System.out.println(op.get());
}
```

### 4.2 规约

- `T reduce(T identity, BinaryOperator<T> accumulator)` 可以将流中的元素反复结合起来，得到一个值，返回 T
- `Optional<T> reduce(BinaryOperator<T> accumulator)` 可以将流中的元素反复结合起来，得到一个值，返回 `Optional<T>`

> 备注：map 和 reduce 的连接通常称为 map-reduce 模式，因 Google 用它来进行网络搜索而出名

#### 1. 实例

```java
@Test
public void t9() {
    List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    Integer sum = list.stream()
            .reduce(0, (x, y) -> x + y);
    System.out.println("sum : " + sum);
}
```

> 说明 : 
> 首先将起始值 0 给 x，然后在流中取出一个元素 1 给了 y，然后 x y 相加结果为 1，再赋给 x，然后再取出一个元素 2 赋给y，然后 x y 相加结果为 3，以此类推

#### 2. 实例

```java
/**
 * 计算所有人工资的总和
 */
@Test
public void t10() {
    Optional<Double> op = emps.stream()
            .map(Employee::getSalary)
            .reduce(Double::sum);
    System.out.println("Salary Sum : " + op.get());
}
```

### 4.3 收集

- collect 将流转换为其它形式，接收一个 Collector（收集器） 接口的实现，用于给 Stream 中元素做汇总的方法

Collector 接口中方法的实现决定了如何对流执行收集操作（如收集到List、Set、Map）。但是 Collector 实现类提供了很多静态方法，可以方便地创建常见收集器实例，具体方法与实例如下表：

#### 1. 实例 - 将结果收集到 List、Set 等容器

```java
@Test
public void t1() {
    List<String> list = emps.stream()
            .map(Employee::getName)
            .collect(Collectors.toList());
    list.forEach(System.out::println);

    System.out.println("------------------------------------------");

    Set<String> set = emps.stream()
            .map(Employee::getName)
            .collect(Collectors.toSet());
    set.forEach(System.out::println);

    System.out.println("------------------------------------------");

    HashSet<String> hs = emps.stream()
            .map(Employee::getName)
            .collect(Collectors.toCollection(HashSet::new));
    hs.forEach(System.out::println);
}
```

#### 2. 实例 - 计算

```java
@Test
public void t2() {
    Long count = emps.stream()
            .collect(Collectors.counting());
    System.out.println("总数 : " + count);

    System.out.println("------------------------------------------");

    Double avg = emps.stream()
            .collect(Collectors.averagingDouble(Employee::getSalary));
    System.out.println("工资平均值 : " + avg);

    System.out.println("------------------------------------------");

    Double sum = emps.stream()
            .collect(Collectors.summingDouble(Employee::getSalary));
    System.out.println("工资总和 : " + sum);

    System.out.println("------------------------------------------");

    Optional<Employee> max = emps.stream()
            .collect(Collectors.maxBy((e1,e2) -> Double.compare(e1.getSalary(),e2.getSalary())));
    System.out.println("工资最多的员工 : " + max.get());

    System.out.println("------------------------------------------");

    Optional<Double> min = emps.stream()
            .map(Employee::getSalary)
            .collect(Collectors.minBy(Double::compare));
    System.out.println("工资最少的员工 : " + min.get());

}
```

#### 3. 实例 - 计算的另一种实现方式

```java
@Test
public void t6() {
    DoubleSummaryStatistics dss = emps.stream()
            .collect(Collectors.summarizingDouble(Employee::getSalary));
    
    System.out.println("sum : " + dss.getSum());
    System.out.println("max : " + dss.getMax());
    System.out.println("avg : " + dss.getAverage());
    System.out.println("count : " + dss.getCount());
    System.out.println("min : " + dss.getMin());
}
```



### 4.4 分组

分组就相当于 SQL 语句中的 group by，按一个类别或多个类别进行分组

#### 1. 实例

```java
@Test
public void t3() {
    Map<Employee.Status, List<Employee>> map = emps.stream()
            .collect(Collectors.groupingBy(Employee::getStatus));
    // 格式化输出，方便查看
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    System.out.println(gson.toJson(map));
}
```


#### 2. 实例 多级分组

```java
 @Test
public void t4() {
    Map<Employee.Status, Map<String, List<Employee>>> map = emps.stream()
            .collect(Collectors.groupingBy(Employee::getStatus, Collectors.groupingBy((e) -> {
                if (e.getAge() <= 35) {
                    return "青年";
                } else if (e.getAge() <= 50) {
                    return "中年";
                } else {
                    return "老年";
                }
            })));
    // 格式化输出，方便查看
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    System.out.println(gson.toJson(map));
}
```

### 4.5 分区

分区是一种特殊的分组，结果 map 至少包含两个不同的分组一个true，一个false

```java
@Test
public void t5() {
    Map<Boolean,List<Employee>> map = emps.stream()
            .collect(Collectors.partitioningBy((e) -> e.getSalary() > 1000));
    // 格式化输出，方便查看
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    System.out.println(gson.toJson(map));
}
```

### 4.6 连接

将结果进行连接

```java
@Test
public void t8() {
    String s1 = emps.stream()
            .map(Employee::getName)
            .collect(Collectors.joining());
    System.out.println("连接 : " + s1);

    String s2 = emps.stream()
            .map(Employee::getName)
            .collect(Collectors.joining(","));
    System.out.println("添加中间分隔符 : " + s2);

    String s3 = emps.stream()
            .map(Employee::getName)
            .collect(Collectors.joining(",", "==", "=="));
    System.out.println("添加左右分隔符 : " + s3);
}
```