---
layout: post
title:  Markdown备忘录
description: ""
modified: 2016-07-26 17:20:20
tags: [Markdown]
post_type: developer
categories: [Markdown]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---

# Markdown语法备忘



## 一、区块元素

### 1.标题

```markdown
# 这是h1
## 这是h2
### 这是h3
#### 这是h4
##### 这是h5
###### 这是h6
```
显示效果：

<h1>这是h1</h1>
<h2>这是h2</h2>
<h3>这是h3</h3>
<h4>这是h4</h4>
<h5>这是h5</h5>
<h6>这是h6</h6>

### 2.段落和换行

一个 Markdown 段落是由一个或多个连续的文本行组成，它的前后要有一个以上的空行（空行的定义是显示上看起来像是空的，便会被视为空行。比方说，若某一行只包含空格和制表符，则该行也会被视为空行）。普通段落不该用空格或制表符来缩进。

如果你确实想要依赖 Markdown 来插入 <br /> 标签的话，在插入处先按入两个以上的空格然后回车。

### 3.区块引用

```markdown
> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitrisus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.
```

显示效果:

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitrisus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.


区块引用可以嵌套（例如：引用内的引用），只要根据层次加上不同数量的 > ：

```
> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.
```

效果:

> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.

引用的区块内也可以使用其他的 Markdown 语法，包括标题、列表、代码区块等：

```
> ## 这是一个标题。
>
> 1.   这是第一行列表项。
> 2.   这是第二行列表项。
>
> 给出一些例子代码：
>
>     return shell_exec("echo $input | $markdown_script");
```

效果:

> ## 这是一个标题。
>
> 1.   这是第一行列表项。
> 2.   这是第二行列表项。
>
> 给出一些例子代码：
>
>     return shell_exec("echo $input | $markdown_script");

### 4.列表
