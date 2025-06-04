import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.example.aiarchdesigner.model.GeneratedFile;
import com.example.aiarchdesigner.service.CodeGenerationService;
import com.example.aiarchdesigner.utils.fileWriteUtil;
import org.junit.jupiter.api.Test;

import java.util.List;

public class test001 {

    public static String test1 = "[\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/Application.java\",\n" +
            "    \"code\": \"package com.example;\\n\\nimport org.springframework.boot.SpringApplication;\\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\\n\\n@SpringBootApplication\\npublic class Application {\\n    public static void main(String[] args) {\\n        SpringApplication.run(Application.class, args);\\n    }\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/controller/OperationLogController.java\",\n" +
            "    \"code\": \"package com.example.controller;\\n\\nimport com.example.model.OperationLog;\\nimport com.example.service.OperationLogService;\\nimport org.springframework.beans.factory.annotation.Autowired;\\nimport org.springframework.web.bind.annotation.*;\\n\\nimport java.util.List;\\n\\n@RestController\\n@RequestMapping(\\\"/api/operation-logs\\\")\\npublic class OperationLogController {\\n\\n    @Autowired\\n    private OperationLogService operationLogService;\\n\\n    @GetMapping\\n    public List<OperationLog> getAllOperationLogs() {\\n        return operationLogService.getAllOperationLogs();\\n    }\\n\\n    @GetMapping(\\\"/{id}\\\")\\n    public OperationLog getOperationLogById(@PathVariable Long id) {\\n        return operationLogService.getOperationLogById(id);\\n    }\\n\\n    @PostMapping\\n    public OperationLog createOperationLog(@RequestBody OperationLog operationLog) {\\n        return operationLogService.createOperationLog(operationLog);\\n    }\\n\\n    @PutMapping(\\\"/{id}\\\")\\n    public OperationLog updateOperationLog(@PathVariable Long id, @RequestBody OperationLog operationLog) {\\n        return operationLogService.updateOperationLog(id, operationLog);\\n    }\\n\\n    @DeleteMapping(\\\"/{id}\\\")\\n    public void deleteOperationLog(@PathVariable Long id) {\\n        operationLogService.deleteOperationLog(id);\\n    }\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/service/OperationLogService.java\",\n" +
            "    \"code\": \"package com.example.service;\\n\\nimport com.example.model.OperationLog;\\nimport java.util.List;\\n\\npublic interface OperationLogService {\\n    List<OperationLog> getAllOperationLogs();\\n    OperationLog getOperationLogById(Long id);\\n    OperationLog createOperationLog(OperationLog operationLog);\\n    OperationLog updateOperationLog(Long id, OperationLog operationLog);\\n    void deleteOperationLog(Long id);\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/service/impl/OperationLogServiceImpl.java\",\n" +
            "    \"code\": \"package com.example.service.impl;\\n\\nimport com.example.mapper.OperationLogMapper;\\nimport com.example.model.OperationLog;\\nimport com.example.service.OperationLogService;\\nimport org.springframework.beans.factory.annotation.Autowired;\\nimport org.springframework.stereotype.Service;\\n\\nimport java.util.List;\\n\\n@Service\\npublic class OperationLogServiceImpl implements OperationLogService {\\n\\n    @Autowired\\n    private OperationLogMapper operationLogMapper;\\n\\n    @Override\\n    public List<OperationLog> getAllOperationLogs() {\\n        return operationLogMapper.findAll();\\n    }\\n\\n    @Override\\n    public OperationLog getOperationLogById(Long id) {\\n        return operationLogMapper.findById(id);\\n    }\\n\\n    @Override\\n    public OperationLog createOperationLog(OperationLog operationLog) {\\n        operationLogMapper.insert(operationLog);\\n        return operationLog;\\n    }\\n\\n    @Override\\n    public OperationLog updateOperationLog(Long id, OperationLog operationLog) {\\n        operationLog.setId(id);\\n        operationLogMapper.update(operationLog);\\n        return operationLog;\\n    }\\n\\n    @Override\\n    public void deleteOperationLog(Long id) {\\n        operationLogMapper.delete(id);\\n    }\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/mapper/OperationLogMapper.java\",\n" +
            "    \"code\": \"package com.example.mapper;\\n\\nimport com.example.model.OperationLog;\\nimport org.apache.ibatis.annotations.*;\\n\\nimport java.util.List;\\n\\n@Mapper\\npublic interface OperationLogMapper {\\n    @Select(\\\"SELECT * FROM operation_log\\\")\\n    List<OperationLog> findAll();\\n\\n    @Select(\\\"SELECT * FROM operation_log WHERE id = #{id}\\\")\\n    OperationLog findById(Long id);\\n\\n    @Insert(\\\"INSERT INTO operation_log(operation, operator, operation_time, details) VALUES(#{operation}, #{operator}, #{operationTime}, #{details})\\\")\\n    void insert(OperationLog operationLog);\\n\\n    @Update(\\\"UPDATE operation_log SET operation=#{operation}, operator=#{operator}, operation_time=#{operationTime}, details=#{details} WHERE id=#{id}\\\")\\n    void update(OperationLog operationLog);\\n\\n    @Delete(\\\"DELETE FROM operation_log WHERE id = #{id}\\\")\\n    void delete(Long id);\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/model/OperationLog.java\",\n" +
            "    \"code\": \"package com.example.model;\\n\\nimport java.time.LocalDateTime;\\n\\npublic class OperationLog {\\n    private Long id;\\n    private String operation;\\n    private String operator;\\n    private LocalDateTime operationTime;\\n    private String details;\\n\\n    // Getters and Setters\\n    public Long getId() {\\n        return id;\\n    }\\n\\n    public void setId(Long id) {\\n        this.id = id;\\n    }\\n\\n    public String getOperation() {\\n        return operation;\\n    }\\n\\n    public void setOperation(String operation) {\\n        this.operation = operation;\\n    }\\n\\n    public String getOperator() {\\n        return operator;\\n    }\\n\\n    public void setOperator(String operator) {\\n        this.operator = operator;\\n    }\\n\\n    public LocalDateTime getOperationTime() {\\n        return operationTime;\\n    }\\n\\n    public void setOperationTime(LocalDateTime operationTime) {\\n        this.operationTime = operationTime;\\n    }\\n\\n    public String getDetails() {\\n        return details;\\n    }\\n\\n    public void setDetails(String details) {\\n        this.details = details;\\n    }\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/resources/application.properties\",\n" +
            "    \"code\": \"spring.datasource.url=jdbc:mysql://localhost:3306/operation_log_db?useSSL=false&serverTimezone=UTC\\nspring.datasource.username=root\\nspring.datasource.password=password\\nspring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver\\n\\nspring.jpa.hibernate.ddl-auto=none\\n\\nmybatis.mapper-locations=classpath:mapper/*.xml\\nmybatis.type-aliases-package=com.example.model\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/resources/schema.sql\",\n" +
            "    \"code\": \"CREATE TABLE IF NOT EXISTS operation_log (\\n    id BIGINT AUTO_INCREMENT PRIMARY KEY,\\n    operation VARCHAR(255) NOT NULL,\\n    operator VARCHAR(255) NOT NULL,\\n    operation_time DATETIME NOT NULL,\\n    details TEXT\\n);\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"pom.xml\",\n" +
            "    \"code\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<project xmlns=\\\"http://maven.apache.org/POM/4.0.0\\\" xmlns:xsi=\\\"http://www.w3.org/2001/XMLSchema-instance\\\"\\n         xsi:schemaLocation=\\\"http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd\\\">\\n    <modelVersion>4.0.0</modelVersion>\\n    <parent>\\n        <groupId>org.springframework.boot</groupId>\\n        <artifactId>spring-boot-starter-parent</artifactId>\\n        <version>2.7.0</version>\\n        <relativePath/>\\n    </parent>\\n    <groupId>com.example</groupId>\\n    <artifactId>operation-log</artifactId>\\n    <version>0.0.1-SNAPSHOT</version>\\n    <name>operation-log</name>\\n    <description>Operation Log Management System</description>\\n\\n    <properties>\\n        <java.version>11</java.version>\\n    </properties>\\n\\n    <dependencies>\\n        <dependency>\\n            <groupId>org.springframework.boot</groupId>\\n            <artifactId>spring-boot-starter-web</artifactId>\\n        </dependency>\\n        <dependency>\\n            <groupId>org.mybatis.spring.boot</groupId>\\n            <artifactId>mybatis-spring-boot-starter</artifactId>\\n            <version>2.2.2</version>\\n        </dependency>\\n        <dependency>\\n            <groupId>mysql</groupId>\\n            <artifactId>mysql-connector-java</artifactId>\\n            <scope>runtime</scope>\\n        </dependency>\\n        <dependency>\\n            <groupId>org.springframework.boot</groupId>\\n            <artifactId>spring-boot-starter-test</artifactId>\\n            <scope>test</scope>\\n        </dependency>\\n    </dependencies>\\n\\n    <build>\\n        <plugins>\\n            <plugin>\\n                <groupId>org.springframework.boot</groupId>\\n                <artifactId>spring-boot-maven-plugin</artifactId>\\n            </plugin>\\n        </plugins>\\n    </build>\\n\\n</project>\"\n" +
            "  }\n" +
            "]";

    public static String test2 = "```json\n" +
            "[\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/logging/Application.java\",\n" +
            "    \"code\": \"package com.example.logging;\\n\\nimport org.springframework.boot.SpringApplication;\\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\\n\\n@SpringBootApplication\\npublic class Application {\\n    public static void main(String[] args) {\\n        SpringApplication.run(Application.class, args);\\n    }\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/logging/controller/OperationLogController.java\",\n" +
            "    \"code\": \"package com.example.logging.controller;\\n\\nimport com.example.logging.model.OperationLog;\\nimport com.example.logging.service.OperationLogService;\\nimport org.springframework.beans.factory.annotation.Autowired;\\nimport org.springframework.web.bind.annotation.*;\\n\\nimport java.util.List;\\n\\n@RestController\\n@RequestMapping(\\\"/api/logs\\\")\\npublic class OperationLogController {\\n\\n    @Autowired\\n    private OperationLogService operationLogService;\\n\\n    @GetMapping\\n    public List<OperationLog> getAllLogs() {\\n        return operationLogService.getAllLogs();\\n    }\\n\\n    @GetMapping(\\\"/{id}\\\")\\n    public OperationLog getLogById(@PathVariable Long id) {\\n        return operationLogService.getLogById(id);\\n    }\\n\\n    @PostMapping\\n    public OperationLog createLog(@RequestBody OperationLog log) {\\n        return operationLogService.createLog(log);\\n    }\\n\\n    @PutMapping(\\\"/{id}\\\")\\n    public OperationLog updateLog(@PathVariable Long id, @RequestBody OperationLog log) {\\n        return operationLogService.updateLog(id, log);\\n    }\\n\\n    @DeleteMapping(\\\"/{id}\\\")\\n    public void deleteLog(@PathVariable Long id) {\\n        operationLogService.deleteLog(id);\\n    }\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/logging/service/OperationLogService.java\",\n" +
            "    \"code\": \"package com.example.logging.service;\\n\\nimport com.example.logging.model.OperationLog;\\nimport com.example.logging.repository.OperationLogMapper;\\nimport org.springframework.beans.factory.annotation.Autowired;\\nimport org.springframework.stereotype.Service;\\n\\nimport java.util.List;\\n\\n@Service\\npublic class OperationLogService {\\n\\n    @Autowired\\n    private OperationLogMapper operationLogMapper;\\n\\n    public List<OperationLog> getAllLogs() {\\n        return operationLogMapper.findAll();\\n    }\\n\\n    public OperationLog getLogById(Long id) {\\n        return operationLogMapper.findById(id);\\n    }\\n\\n    public OperationLog createLog(OperationLog log) {\\n        operationLogMapper.insert(log);\\n        return log;\\n    }\\n\\n    public OperationLog updateLog(Long id, OperationLog log) {\\n        log.setId(id);\\n        operationLogMapper.update(log);\\n        return log;\\n    }\\n\\n    public void deleteLog(Long id) {\\n        operationLogMapper.deleteById(id);\\n    }\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/logging/repository/OperationLogMapper.java\",\n" +
            "    \"code\": \"package com.example.logging.repository;\\n\\nimport com.example.logging.model.OperationLog;\\nimport org.apache.ibatis.annotations.*;\\n\\nimport java.util.List;\\n\\n@Mapper\\npublic interface OperationLogMapper {\\n\\n    @Select(\\\"SELECT * FROM operation_log\\\")\\n    List<OperationLog> findAll();\\n\\n    @Select(\\\"SELECT * FROM operation_log WHERE id = #{id}\\\")\\n    OperationLog findById(Long id);\\n\\n    @Insert(\\\"INSERT INTO operation_log(operation, operator, operation_time, details) \\\" +\\n            \\\"VALUES(#{operation}, #{operator}, #{operationTime}, #{details})\\\")\\n    void insert(OperationLog log);\\n\\n    @Update(\\\"UPDATE operation_log SET operation=#{operation}, operator=#{operator}, \\\" +\\n            \\\"operation_time=#{operationTime}, details=#{details} WHERE id=#{id}\\\")\\n    void update(OperationLog log);\\n\\n    @Delete(\\\"DELETE FROM operation_log WHERE id = #{id}\\\")\\n    void deleteById(Long id);\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/java/com/example/logging/model/OperationLog.java\",\n" +
            "    \"code\": \"package com.example.logging.model;\\n\\nimport java.time.LocalDateTime;\\n\\npublic class OperationLog {\\n    private Long id;\\n    private String operation;\\n    private String operator;\\n    private LocalDateTime operationTime;\\n    private String details;\\n\\n    // Getters and Setters\\n    public Long getId() {\\n        return id;\\n    }\\n\\n    public void setId(Long id) {\\n        this.id = id;\\n    }\\n\\n    public String getOperation() {\\n        return operation;\\n    }\\n\\n    public void setOperation(String operation) {\\n        this.operation = operation;\\n    }\\n\\n    public String getOperator() {\\n        return operator;\\n    }\\n\\n    public void setOperator(String operator) {\\n        this.operator = operator;\\n    }\\n\\n    public LocalDateTime getOperationTime() {\\n        return operationTime;\\n    }\\n\\n    public void setOperationTime(LocalDateTime operationTime) {\\n        this.operationTime = operationTime;\\n    }\\n\\n    public String getDetails() {\\n        return details;\\n    }\\n\\n    public void setDetails(String details) {\\n        this.details = details;\\n    }\\n}\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/resources/application.properties\",\n" +
            "    \"code\": \"spring.datasource.url=jdbc:mysql://localhost:3306/operation_log_db?useSSL=false&serverTimezone=UTC\\nspring.datasource.username=root\\nspring.datasource.password=password\\nspring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver\\n\\nmybatis.mapper-locations=classpath:mapper/*.xml\\n\\nspring.jpa.hibernate.ddl-auto=none\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"src/main/resources/schema.sql\",\n" +
            "    \"code\": \"CREATE TABLE IF NOT EXISTS operation_log (\\n    id BIGINT AUTO_INCREMENT PRIMARY KEY,\\n    operation VARCHAR(255) NOT NULL,\\n    operator VARCHAR(255) NOT NULL,\\n    operation_time DATETIME NOT NULL,\\n    details TEXT\\n);\"\n" +
            "  },\n" +
            "  {\n" +
            "    \"filePath\": \"pom.xml\",\n" +
            "    \"code\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<project xmlns=\\\"http://maven.apache.org/POM/4.0.0\\\"\\n         xmlns:xsi=\\\"http://www.w3.org/2001/XMLSchema-instance\\\"\\n         xsi:schemaLocation=\\\"http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd\\\">\\n    <modelVersion>4.0.0</modelVersion>\\n    <parent>\\n        <groupId>org.springframework.boot</groupId>\\n        <artifactId>spring-boot-starter-parent</artifactId>\\n        <version>2.7.0</version>\\n        <relativePath/>\\n    </parent>\\n\\n    <groupId>com.example</groupId>\\n    <artifactId>logging</artifactId>\\n    <version>0.0.1-SNAPSHOT</version>\\n    <name>logging</name>\\n    <description>Operation Log Management System</description>\\n\\n    <properties>\\n        <java.version>11</java.version>\\n    </properties>\\n\\n    <dependencies>\\n        <dependency>\\n            <groupId>org.springframework.boot</groupId>\\n            <artifactId>spring-boot-starter-web</artifactId>\\n        </dependency>\\n\\n        <dependency>\\n            <groupId>org.mybatis.spring.boot</groupId>\\n            <artifactId>mybatis-spring-boot-starter</artifactId>\\n            <version>2.2.2</version>\\n        </dependency>\\n\\n        <dependency>\\n            <groupId>mysql</groupId>\\n            <artifactId>mysql-connector-java</artifactId>\\n            <scope>runtime</scope>\\n        </dependency>\\n\\n        <dependency>\\n            <groupId>org.springframework.boot</groupId>\\n            <artifactId>spring-boot-starter-test</artifactId>\\n            <scope>test</scope>\\n        </dependency>\\n    </dependencies>\\n\\n    <build>\\n        <plugins>\\n            <plugin>\\n                <groupId>org.springframework.boot</groupId>\\n                <artifactId>spring-boot-maven-plugin</artifactId>\\n            </plugin>\\n        </plugins>\\n    </build>\\n\\n</project>\"\n" +
            "  }\n" +
            "]\n" +
            "```";
    @Test
    public void test001() {
        System.out.println("====");
        String lastTxt = test2.replace("```json", "").replace("```", "");
        List<GeneratedFile> generatedFiles = JSON.parseObject(lastTxt, new TypeReference<List<GeneratedFile>>() {
        });
        for (GeneratedFile generatedFile : generatedFiles) {
            System.out.println(generatedFile.getFilePath());
            System.out.println(generatedFile.getCode());
        }
    }

    @Test
    public void test002(){
        String lastTxt = test2.replace("```json", "").replace("```", "");
        List<GeneratedFile> generatedFiles = JSON.parseObject(lastTxt, new TypeReference<List<GeneratedFile>>() {
        });
        fileWriteUtil.fileWriting(generatedFiles);
    }



}
