

## 1. 脚本运行
### 1.1 脚本模式

建立一个文本文件hello，后缀名以`.py`结尾，填入一下内容

```python
print('hello, world')
```

注意`print`前面不要有任何空格

直接运行是会报错误的，因为没有权限执行（Permission denied），需要给权限。下面方式

```shell
chmod +x ./hello   # 使每个人都有执行的权限
chmod +rx ./hello  # 使每个人都有读和执行的权限
chmod u+rx ./hello # 仅仅使脚本文件拥有者有读和执行的权限
chmod u+x ./hello  # 只有自己可以执行，其它人不能执行
chmod ug+x ./hello # 只有自己以及同一群可以执行，其它人不能执行
chmod 555 ./hello  # 使每个人都有读和执行的权限
chmod 777 ./hello
```

控制台输入`python3 hello.py`运行脚本就可以输出结果了


如果想要像shell脚本一样用`./`运行的话，需要加入脚本注释，如下

```python
#!/usr/bin/env python3
print('hello, world')
```

这样直接输入`./hello.py`就可以运行了

### 1.2 交互模式

直接在控制台输入python3进入到python的交互模式，在控制台输入`print('hello, world')`就可以直接输出结果了
