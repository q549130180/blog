---
layout: post
title:  SpringBoot 集成 Swagger2
description: "Swagger 号称世界最流行的接口文档服务器，界面美观，插件也还比较多，可以针对后端语言直接生成测试代码。下面我们将介绍 SpringBoot 集成 Swagger2 的过程。"
modified: 2019-10-20 17:20:20
tags: [Spring,Spring Boot,Swagger,Swagger2,Java]
post_type: developer
categories: [Spring Boot]
image:
  feature: posts_header/abstract-4.jpg
  credit:
  creditlink:
---


## 1. 概述

### 1.1 简介

Swagger 号称世界最流行的接口文档服务器，界面美观，插件也还比较多，可以针对后端语言直接生成测试代码。下面我们将介绍 SpringBoot 集成 Swagger2 的过程。


## 2. Spring Boot 集成 Swagger2

### 2.1 引入 jar 包

```xml
<!--  引入swagger包 start -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
<!--  引入swagger包 end -->
```

### 2.2 创建配置类


```java
package me.lingfeng.swagger2.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

/**
 * @author 凌风
 * @date 2019/10/6 00:15
 */
@Configuration
@EnableSwagger2
public class Swagger2Config {

    @Bean(value = "defaultApi")
    public Docket createDefaultRestApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .groupName("Default Interface")
                .select()
                .apis(RequestHandlerSelectors.basePackage("me.lingfeng.swagger2.controller"))
//                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build();
    }


    private ApiInfo apiInfo() {
        // 定义联系人信息
        Contact contact = new Contact("lingfeng","http://lingfeng.me/blog/", "yellow.716@163.com");
        return new ApiInfoBuilder()
                .title("Swagger2 Demo API") // 标题
                .description("Swagger2 Demo API") // 描述信息
                .version("0.0.1") // //版本
                .license("Apache 2.0")
                .licenseUrl("http://www.apache.org/licenses/LICENSE-2.0")
                .contact(contact)
                .build();

    }
}
```


### 2.3 Swagger 注解概述

- `@Api` : 用在类上，标志此类是Swagger资源
  - `value` : 接口说明
  - `tags` : 接口说明，可以在页面中显示。可以配置多个，当配置多个的时候，在页面中会显示多个接口的信息

- `@ApiOperation` : 用在方法上，描述方法的作用
  - `value` : 接口说明。
  - `notes` : 接口发布说明。
  - `tags` : 标签。
  - `response` : 接口返回类型。
  - `httpMethod` : 接口请求方式。

- `@ApiIgnore` : Swagger 文档不会显示拥有该注解的接口。

- `@ApiImplicitParams` : 包装器：包含多个 `ApiImplicitParam` 对象列表

- `@ApiImplicitParam` : 定义在 `@ApiImplicitParams` 注解中，定义单个参数详细信息
  - `paramType` : 参数放在哪个地方
    - `header` : 请求参数的获取：`@RequestHeader`
    - `query` : 请求参数的获取：`@RequestParam`
    - `path` : （用于restful接口）-->请求参数的获取：`@PathVariable`
    - `body` : （以流的形式提交 仅支持POST）
    - `form` : （以form表单的形式提交 仅支持POST）
  - `name` : 参数名（方法入参变量名称）
  - `dataType` : 参数的数据类型 只作为标志说明，并没有实际验证
    - `Long`
    - `String`
  - `required` : 参数是否必须传
    - `true`
    - `false`
  - `value` : 参数的意义
  - `defaultValue` : 参数的默认值

- `@ApiModel` : 描述一个 Swagger Model 的额外信息 `@ApiModel` 用在类上，表示对类进行说明，用于实体类中的参数接收说明
	
- `@ApiModelProperty` : 在 model 类的属性添加属性说明
  - `value` : 字段说明。
  - `name` : 重写字段名称。
  - `dataType` : 重写字段类型。
  - `required` : 是否必填。
  - `example` : 举例说明。
  - `hidden` : 是否在文档中隐藏该字段。
  - `allowEmptyValue` : 是否允许为空。
  - `allowableValues` : 该字段允许的值，当我们 API 的某个参数为枚举类型时，使用这个属性就可以清楚地告诉 API 使用者该参数所能允许传入的值。

- `@ApiParam` : 用于 `Controller` 中方法的参数说明

- `@ApiResponses` : 包装器：包含多个 `ApiResponse` 对象列表
	
- `@ApiResponse` : 定义在 `@ApiResponses` 注解中，一般用于描述一个错误的响应信息
   - `code` : 错误码，例如 400
   - `message` : 信息，例如"请求参数没填好"
   - `response` : 抛出异常的类
		
- `@Authorization` : Declares an authorization scheme to be used on a resource or an operation.

- `@AuthorizationScope` : Describes an OAuth2 authorization scope.



### 2.4 Demo 演示

#### 创建实体类

```java
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * @author 凌风
 * @date 2019/10/12 10:54
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ApiModel(value = "用户VO", description = "描述用户基础信息")
public class UserVO implements Serializable {

    @ApiModelProperty(name = "用户id", value = "用户的唯一id", required = true, example = "1")
    private Long userId;

    @ApiModelProperty(name = "用户名称", value = "用户的姓名", required = false, example = "凌风")
    private String userName;

    @ApiModelProperty(name = "用户密码", value = "用户登录密码", required = true, example = "123456")
    private String passWord;

    @ApiModelProperty(name = "用户年龄", value = "用户年龄", required = false, example = "12")
    private Integer age;

    @ApiModelProperty(name = "创建时间", value = "数据创建时间", required = false, example = "")
    private LocalDateTime createTime;

    @ApiModelProperty(name = "修改时间", value = "数据修改时间", required = false, example = "")
    private LocalDateTime modifyTime;
}
```

#### 创建 Controller

```java
package me.lingfeng.swagger2.controller;

import io.swagger.annotations.*;
import me.lingfeng.swagger2.vo.UserVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @author 凌风
 * @date 2019/10/6 00:08
 */
@RestController
@RequestMapping("/user")
@Api(value = "用户操作 API", tags = "用户")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    /**
     * @return
     */
    @ApiOperation(value = "添加用户", httpMethod = "POST")
    @PostMapping("/add")
    public boolean add(@RequestBody UserVO user) {
        logger.info("User : {}", user);
        return true;
    }

    /**
     * @return
     */
    @ApiOperation(value = "根据id删除用户", httpMethod = "DELETE")
    @ApiImplicitParam(name = "id", value = "用户id", required = true, dataType = "Long", paramType = "path", example = "1")
    @ApiResponses({
            @ApiResponse(code = 400, message = "服务器异常"),
            @ApiResponse(code = 500, message = "权限不足")
    })
    @DeleteMapping("/delete/{id}")
    public boolean delete(@PathVariable("id") Long id) {
        logger.info("id : {}", id);
        return true;
    }

    /**
     * @param id
     * @return
     */
    @ApiOperation(value = "根据id获取用户", response = UserVO.class, httpMethod = "GET")
    @ApiImplicitParam(name = "id", value = "用户id", required = true, dataType = "Long", paramType = "path", example = "1")
    @GetMapping("/find/{id}")
    public UserVO findById(@PathVariable("id") Long id) {
        UserVO userVO = new UserVO();
        userVO.setUserId(id);
        userVO.setUserName("凌风");
        userVO.setPassWord("123456");
        userVO.setAge(18);
        userVO.setCreateTime(LocalDateTime.now());
        userVO.setModifyTime(LocalDateTime.now());

        return userVO;
    }

    /**
     * @return
     */
    @ApiOperation(value = "根据id跟新用户", httpMethod = "PUT")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "id", value = "用户ID", required = true, dataType = "Long", paramType = "path", example = "1")
    })
    @PutMapping("/update/{id}")
    public boolean update(@PathVariable("id") Long id, @RequestBody UserVO user) {
        logger.info("id : {}", id);
        logger.info("User : {}", user);
        return true;
    }

    @ApiOperation(value = "根据用户名称查询用户 - 返回List", httpMethod = "POST", response = UserVO.class, responseContainer = "List")
    @ApiImplicitParam(name = "userName", value = "用户名称", required = true, dataType = "String", paramType = "body", example = "凌风")
    @PostMapping("/find_by_name")
    public List<UserVO> findByUserName(@RequestBody String userName) {
        logger.info("userName : {}", userName);

        List<UserVO> userList = new ArrayList<>();

        for (Integer i = 0; i < 10; i++) {
            UserVO userVO = new UserVO();
            userVO.setUserId(i.longValue());
            userVO.setUserName(userName + i);
            userVO.setPassWord("123456" + i);
            userVO.setAge(i);
            userVO.setCreateTime(LocalDateTime.now());
            userVO.setModifyTime(LocalDateTime.now());
            userList.add(userVO);
        }

        return userList;
    }
}
```

启动相互访问地址：http://127.0.0.1:8080/swagger-ui.html#/ ,就可以看到 Swagger API 的界面了

![swagger](http://image.lingfeng.me/images/swagger/swagger_2019_10_20_002.jpg)


### 2.5 使用 Bootstrap UI

添加 jar 包

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>swagger-bootstrap-ui</artifactId>
    <version>1.9.6</version>
</dependency>
```

在 `Swagger2Config` 类上添加如下两个注解

```java
@EnableSwaggerBootstrapUI
@Import(BeanValidatorPluginsConfiguration.class)
```



启动项目访问地址：http://127.0.0.1:8080/doc.html ,可以使用 Bootstrap UI 了。

![swagger](http://image.lingfeng.me/images/swagger/swagger_bootstrapui_2019_10_20_001.jpg)

### 2.6 添加 API 组

在 `Swagger2Config` 中添加 Bean 即可，注意 apis 配置相应的扫描路径

```java
@Bean(value = "groupApi")
public Docket createGroupRestApi() {
    return new Docket(DocumentationType.SWAGGER_2)
            .apiInfo(apiInfo())
            .groupName("Group Interface")
            .select()
            .apis(RequestHandlerSelectors.basePackage("me.lingfeng.swagger2.group"))
            .paths(PathSelectors.any())
            .build();
}
```

![swagger](http://image.lingfeng.me/images/swagger/swagger_group_2019_10_20_003.jpg)


##### 参考资料

- [Swagger 官网](http://swagger.io/)
- [Swagger Bootstrap UI](https://github.com/xiaoymin/swagger-bootstrap-ui)
