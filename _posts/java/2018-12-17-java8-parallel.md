---
layout: post
title:  Java 8 并行流与串行流
description: "并行流就是把一个内容分成多个数据块，并用不同的线程分别处理每个数据块的流 Java 8 中将并行进行了优化，我们可以很容易的对数据进行并行操作，Stream API 可以声明性地通过 parallel() 与 sequential() 在并行流与顺序流之间进行切换。"
modified: 2018-12-17 19:20:20
tags: [Java,Lambda,Java 8,Stream API]
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

**并行流**就是把一个内容分成多个数据块，并用不同的线程分别处理每个数据块的流

Java 8 中将并行进行了优化，我们可以很容易的对数据进行并行操作，Stream API 可以声明性地通过 `parallel()` 与 `sequential()` 在并行流与顺序流之间进行切换。

### 1.2 了解 Fork/Join 框架

Fork/Join 框架就是在必要的情况下，将一个大任务，进行拆分（fork）成若干个小任务（拆到不可再拆是），再将一个个的小任务运算的结果进行 join 汇总


![Java 8](http://image.huangxubo.me/images/java/java_stream_2018_12_18_001.jpg)

### 1.3 Fork/Join 框架与传统线程池的区别

采用“工作窃取”模式（work-stealing) : 当执行新的任务时它可以将其拆分分成更小的任务执行，并将小任务加到线程队列中，然后再从一个随机线程的队列中偷一个并把它放在自己的队列中。

相对于一般的线程池实现，Fork/Join  框架的优势体现在对其中包含的任务的处理方式上。在一般的线程池中，如果一个线程正在执行的任务由于某些原因无法继续运行，那么该线程会处于等待状态。而在 Fork/Join 框架实现中，如果某个子问题由于等待另外一个子问题的完成而无法继续运行。那么处理该子问题的线程会主动寻找其他尚未运行的子问题来执行。这种方式减少了线程的等待时间，提高了性能。

## 2. Fork/Join 使用

这里我们的需求是对 0 到一亿进行累加操作，下面是 Fork/Join 的处理方法

```java
public class ForkJoinCalculate extends RecursiveTask<Long> {

    private long start;
    private long end;

    private static final long THRESHOLD = 10000L; //临界值

    public ForkJoinCalculate(long start, long end) {
        this.start = start;
        this.end = end;
    }

    @Override
    protected Long compute() {
        long length = end - start;

        if (length <= THRESHOLD) {
            long sum = 0;

            for (long i = start; i <= end; i++) {
                sum += i;
            }

            return sum;
        } else {
            long middle = (start + end) / 2;

            ForkJoinCalculate left = new ForkJoinCalculate(start, middle);
            left.fork(); //拆分，并将该子任务压入线程队列

            ForkJoinCalculate right = new ForkJoinCalculate(middle + 1, end);
            right.fork();

            return left.join() + right.join();
        }
    }
}
```

测试方法

```java
@Test
public void test1(){
    long start = System.currentTimeMillis();

    ForkJoinPool pool = new ForkJoinPool();
    ForkJoinTask<Long> task = new ForkJoinCalculate(0L, 100000000L);

    long sum = pool.invoke(task);
    System.out.println(sum);

    long end = System.currentTimeMillis();

    System.out.println("耗费的时间为: " + (end - start));
}
```


## 3. Java 8 使用并行流

其实 Java 8 的并行流底层使用的就是 Fork/Join 框架，但是它帮我们简化了操作

```java
@Test
public void test3(){
    long start = System.currentTimeMillis();

    Long sum = LongStream.rangeClosed(0L, 100000000L)
            .parallel()
            .sum();

    System.out.println(sum);

    long end = System.currentTimeMillis();

    System.out.println("耗费的时间为: " + (end - start));
}
```