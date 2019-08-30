---
layout: post
title:  Java 8 新特性之新的时间日期 API
description: "Java 8 引入了一套全新的时间日期API，操作起来更简便。简单介绍下， LocalDate 和 LocalTime 和 LocalDateTime 的使用。"
modified: 2018-12-20 19:20:20
tags: [Java,Lambda,Java 8,LocalDate,LocalTime,LocalDateTime]
post_type: developer
series: Java 8 系列文章
categories: [Java]
image:
  feature: posts_header/abstract-9.jpg
  credit:
  creditlink:
---

## 1. 概述

### 1.1 简介

Java 8 引入了一套全新的时间日期API，操作起来更简便。简单介绍下，`LocalDate`和`LocalTime`和`LocalDateTime`的使用； 

`java.util.Date`月份从0开始，`java.time.LocalDate`月份从1开始并且提供了枚举。 

`java.util.Date`和`SimpleDateFormatter`都不是线程安全的，而`LocalDate`和`LocalTime`和最基本的`String`一样，是不变类型，不但线程安全，而且不能修改,它们分别使用 ISO-8601 日历系统的日期和时间，它们提供了简单的日期或时间，并不包含当前的时间信息，也不包含与时区相关的信息。

> 注 : ISO-8601 日历系统是国际标准化组织制定的现代公民的日期和时间的表示法

### 1.3 环境

## 2. LocalDate、LocalTime、LocalDateTime

`LocalDate`、`LocalTime`、`LocalDateTime` 三者的使用方式基本一致，所以我们这里就以 `LocalDateTime` 为例进行索命

### 2.1 实例

```java
@Test
public void t1() {
    // 获取当前时间
    LocalDateTime ldt1 = LocalDateTime.now();
    System.out.println(ldt1);

    // 获取指定的时间
    LocalDateTime ldt2 = LocalDateTime.of(2018, 12, 10, 10, 10, 10);
    System.out.println(ldt2);

    // 加两年
    LocalDateTime ldt3 = ldt1.plusYears(2);
    System.out.println(ldt3);

    // 减两个月
    LocalDateTime ldt4 = ldt1.minusYears(2);
    System.out.println(ldt4);

    // 获取年月日时分秒
    System.out.println(ldt1.getYear());
    System.out.println(ldt1.getMonthValue());
    System.out.println(ldt1.getDayOfMonth());
    System.out.println(ldt1.getHour());
    System.out.println(ldt1.getMinute());
    System.out.println(ldt1.getSecond());
}
```

### 2.2 Instant : 时间戳

使用 Unix 元年  1970年1月1日 00:00:00 所经历的毫秒值

```java
@Test
public void t2() {
    Instant ins = Instant.now();  //默认使用 UTC 时区
    System.out.println(ins);

    // 时间偏移量
    OffsetDateTime odt = ins.atOffset(ZoneOffset.ofHours(8));
    System.out.println(odt);

    // 获取毫秒值
    System.out.println(ins.getNano());
    
    // 对于元年开始进行运算
    Instant ins2 = Instant.ofEpochSecond(60);
    System.out.println(ins2);
}
```

### 2.3 Duration : 用于计算两个“时间”间隔

```java
@Test
public void t3() throws InterruptedException {
    // 时间戳
    Instant ins1 = Instant.now();

    Thread.sleep(1000);

    Instant ins2 = Instant.now();
    Duration duration = Duration.between(ins1, ins2);
    System.out.println("所耗费时间为：" + duration.toMillis());

    System.out.println("--------------------------------");

    // LocalTime
    LocalTime lt1 = LocalTime.now();

    Thread.sleep(1000);

    LocalTime lt2 = LocalTime.now();

    System.out.println("所耗费时间为：" + Duration.between(lt1, lt2).toMillis());
}
```

### 2.4 Period : 用于计算两个“日期”间隔

```java
@Test
public void t5() {
    LocalDate ld1 = LocalDate.of(2017, 1, 1);
    LocalDate ld2 = LocalDate.now();
    Period period = Period.between(ld1, ld2);
    System.out.println("相差" + period.getYears() + "年" + period.getMonths() + "月" + period.getDays() + "天");
}
```

### 2.5 日期的操作

`TemporalAdjuster` 时间校正器，有时我们可能需要获取例如：将日期调整到下个周日等操作。

`TemporalAdjusters` 该类通过静态方法提供了大量的常用 `TemporalAdjuster` 的实现。

```java
@Test
public void t6() {
    LocalDateTime ldt = LocalDateTime.now();

    // 指定这个月的一个固定日期
    LocalDateTime ldt2 = ldt.withDayOfMonth(10);
    System.out.println(ldt2);

    // 获取下个周日
    LocalDateTime ldt3 = ldt.with(TemporalAdjusters.next(DayOfWeek.SUNDAY));
    System.out.println("获取下个周日 : " + ldt3);

    // 自定义：获取下个工作日
    LocalDateTime ldt5 = ldt.with((l) -> {
        LocalDateTime ldt6 = (LocalDateTime) l;
        DayOfWeek dayOfWeek = ldt6.getDayOfWeek();

        if (dayOfWeek.equals(DayOfWeek.FRIDAY)) {
            return ldt6.plusDays(3);
        } else if (dayOfWeek.equals(DayOfWeek.SATURDAY)) {
            return ldt6.plusDays(2);
        } else {
            return ldt6.plusDays(1);
        }
    });
    System.out.println("获取下个工作日 : " + ldt5);
}
```

## 3. DateTimeFormatter

### 3.1 简介

在 JDK 1.8 中可以使用 `DateTimeFormatter` 来代替 `SimpleDateFormat` 进行日期的格式化，而且 `DateTimeFormatter` 是线程安全的

### 3.2 实例

```java
@Test
public void t8() {
    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    LocalDateTime ldt = LocalDateTime.now();

    // 将日期格式化为字符串，两种方式否可以
    String dtfDate = dtf.format(ldt);
    String ldtDate = ldt.format(dtf);
    System.out.println("dtfDate : " + dtfDate);
    System.out.println("ldtDate : " + ldtDate);

    // 将字符串格式化为 LocalDateTime
    LocalDateTime ldt2 = LocalDateTime.parse(dtfDate, dtf);
    System.out.println("时间为 : " + ldt2);
}
```

### 3.3 线程安全

在多线程使用 SimpleDateFormat 进行格式化日期的时候会有线程安全问题。

```java
@Test
public void t1() throws Exception {
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

    Callable<Date> task = new Callable<Date>() {
        @Override
        public Date call() throws Exception {
            return sdf.parse("2018-12-10");
        }
    };

    ExecutorService executor = Executors.newFixedThreadPool(10);
    List<Future<Date>> results = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        results.add(executor.submit(task));
    }

    for (Future<Date> future : results) {
        System.out.println(future.get());
    }
    executor.shutdown();
}
```

可以使用 ThreadLocal 的锁解决 SimpleDateFormat 的线程安全问题

```java
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateFormatThreadLocal {
    private static final ThreadLocal<DateFormat> df = new ThreadLocal<DateFormat>() {
        protected DateFormat initialValue() {
            return new SimpleDateFormat("yyyy-MM-dd");
        }
    };

    public static final Date convert(String source) throws ParseException {
        return df.get().parse(source);
    }
}
```

测试方法

```java
@Test
public void t2() throws Exception {
    Callable<Date> task = new Callable<Date>() {
        @Override
        public Date call() throws Exception {
            return DateFormatThreadLocal.convert("2018-12-10");
        }
    };

    ExecutorService executor = Executors.newFixedThreadPool(10);
    List<Future<Date>> results = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        results.add(executor.submit(task));
    }

    for (Future<Date> future : results) {
        System.out.println(future.get());
    }
    executor.shutdown();
}
```

使用 DateTimeFormatter 进行格式化，DateTimeFormatter 是线程安全的

```java
@Test
public void t3() throws Exception {
    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    Callable<LocalDate> task = new Callable<LocalDate>() {
        @Override
        public LocalDate call() throws Exception {
            return LocalDate.parse("2018-12-10",dtf);
        }
    };

    ExecutorService executor = Executors.newFixedThreadPool(10);
    List<Future<LocalDate>> results = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        results.add(executor.submit(task));
    }

    for (Future<LocalDate> future : results) {
        System.out.println(future.get());
    }
    executor.shutdown();
}
```

## 4. 时区设置

```java
@Test
public void t2() {
    LocalDateTime ldt = LocalDateTime.now(ZoneId.of("Asia/Shanghai"));
    System.out.println(ldt);

    // 带时区的时间
    ZonedDateTime zdt = ldt.atZone(ZoneId.of("Asia/Shanghai"));
    System.out.println(zdt);
}
```
