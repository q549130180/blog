---
layout: post
title:  Java 8 新特性之默认方法(Default Methods)
description: "Java 8 引入了新的语言特性——默认方法（Default Methods）。默认方法允许您添加新的功能到现有库的接口中，并能确保与采用旧版本接口编写的代码的二进制兼容性。"
modified: 2018-12-19 16:20:20
tags: [Java,Lambda,Java 8,Default Method]
post_type: developer
series: Java 8 系列文章
categories: [Java]
image:
  feature: posts_header/abstract-11.jpg
  credit:
  creditlink:
---

## 1. 概述

Java 8 引入了新的语言特性——默认方法（Default Methods）。

默认方法允许您添加新的功能到现有库的接口中，并能确保与采用旧版本接口编写的代码的二进制兼容性。

### 1.1 为什么要有默认方法

在 Java 8之前，接口与其实现类之间的耦合度太高了，当需要为一个接口添加方法时，所有的实现类都必须随之修改。默认方法解决了这个问题，它可以为接口添加新的方法，而不会破坏已有的接口的实现。这在 lambda 表达式作为 Java 8 语言的重要特性而出现之际，为升级旧接口且保持向后兼容提供了途径。

还有就就是 Java 8 的函数式接口只允许有一个抽象方法，但可以有多个默认方法。

```java
String[] array = new String[] {"hello",", ","world", };
List<String> list = Arrays.asList(array);
list.forEach(System.out::println); // 这是 jdk 1.8 新增的接口默认方法
```

这个 `forEach` 方法是 jdk 1.8 新增的接口默认方法，正是因为有了默认方法的引入，才不会因为 `Iterable` 接口中添加了 `forEach` 方法就需要修改所有 `Iterable` 接口的实现类。


### 1.2 语法格式

```java
interface InterfaceA {
    default void print() {
        System.out.println("InterfaceA print");
    }
}
```

## 2. 默认方法（default）

### 2.1 实例

```java
interface InterfaceA {
    default void print() {
        System.out.println("InterfaceA print");
    }
}

class ClassA implements InterfaceA {

}
```

```java
public class Java8Test {
    public static void main(String[] args) {
        new ClassA().print(); // 打印：“InterfaceA print”
    }
}
```

`ClassA` 类并没有实现 `InterfaceA` 接口中的 `print` 方法，`InterfaceA` 接口中提供了 `print` 方法的默认实现，因此可以直接调用 `ClassA` 类的 `print` 方法。

### 2.2 默认方法的继承

```java
interface InterfaceA {
    default void print() {
        System.out.println("InterfaceA print");
    }
}

interface InterfaceB extends InterfaceA {

}

interface InterfaceC extends InterfaceA {
    @Override
    default void print() {
        System.out.println("InterfaceC print");
    }
}

interface InterfaceD extends InterfaceA {
    @Override
    void print();
}
```

```java
public class Java8Test {
    public static void main(String[] args) {
        new InterfaceB() {}.print(); // 打印："InterfaceA print"
        new InterfaceC() {}.print();// 打印："InterfaceC print"
        new InterfaceD() {
            @Override
            public void print(){
                System.out.println("InterfaceD print");
            }
        }.print();// 打印：“InterfaceD print”

        // 或者使用 lambda 表达式
        ((InterfaceD) () -> System.out.println("InterfaceD print")).print();
    }
}
```

接口默认方法的继承分三种情况（分别对应上面的 `InterfaceB` 接口、`InterfaceC` 接口和 `InterfaceD` 接口）：

- 不覆写默认方法，直接从父接口中获取方法的默认实现。
- 覆写默认方法，这跟类与类之间的覆写规则相类似。
- 覆写默认方法并将它重新声明为抽象方法，这样新接口的子类必须再次覆写并实现这个抽象方法。

### 2.3 类优先原则

接口默认方法的**类优先**原则

若一个接口中定义了一个默认方法，而另外一个父类或接口中又定义了一个同名的方法时

- 选择父类中的方法。如果一个父类提供了具体的实现，那么接口中具有相同名称和参数的默认方法会被忽略。
- 接口冲突。如果一个父接口提供一个默认方法，而另一个接口也提供了一个具有相同名称和参数列表的方法（不管方法是否是默认方法），那么必须覆盖该方法来解决冲突

```java
public interface FunA {
    default String getName() {
        return "aaaa";
    }
}
public class ClassA {
    public String getName() {
        return "bbb";
    }
}
public class SubClass extends ClassA implements FunA {
}
```

测试方法

```java
@Test
public void t1(){
    SubClass subClass = new SubClass();
    System.out.println(subClass.getName()); // 输出的是 bbb
}
```

> 注意 :
>
> - `default` 关键字只能在接口中使用（以及用在 `switch` 语句的 `default` 分支），不能用在抽象类中。
> - 接口默认方法不能覆写 `Object` 类的 `equals`、`hashCode` 和 `toString` 方法。
> - 接口中的静态方法必须是 `public` 的，`public` 修饰符可以省略，`static` 修饰符不能省略。
> - 即使使用了 java 8 的环境，一些 IDE 仍然可能在一些代码的实时编译提示时出现异常的提示（例如无法发现 java 8 的语法错误），因此不要过度依赖 IDE。

## 3. 静态默认方法

Java 8 的另一个特性是接口可以声明（并且可以提供实现）静态方法

```java
interface InterfaceA {
    default void print() {
        System.out.println("InterfaceA print");
    }

    static void staticMethod(){
        System.out.println("InterfaceA staticMethod");
    }
}
```
