package com.example.aiarchdesigner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.model.ChatResponse;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.*;

/**
 * CodeGenerationService 单元测试类
 * 测试 shouldGenerateFrontend 方法
 */
public class CodeGenerationServiceTest {

    @MockBean
    private ChatClient.Builder mockChatClientBuilder;
    
    @MockBean
    private ObjectMapper mockObjectMapper;

    public static final String designDocumentContent = "# 技术设计文档 - 详细设计\n" +
            "\n" +
            "## 关键时序图\n" +
            "\n" +
            "```mermaid\n" +
            "sequenceDiagram\n" +
            "    participant Client as 客户端\n" +
            "    participant Service as 日志服务\n" +
            "    participant DB as 数据库\n" +
            "\n" +
            "    Note over Client,DB: 1. 创建日志流程\n" +
            "    Client->>+Service: POST /api/logs (含操作数据)\n" +
            "    Service->>+DB: INSERT操作日志\n" +
            "    DB-->>-Service: 插入成功\n" +
            "    Service-->>-Client: 201 Created (完整日志记录)\n" +
            "\n" +
            "    Note over Client,DB: 2. 查询日志流程\n" +
            "    Client->>+Service: GET /api/logs?operator=user1\n" +
            "    Service->>+DB: SELECT条件查询\n" +
            "    DB-->>-Service: 返回日志列表\n" +
            "    Service-->>-Client: 200 OK (分页数据)\n" +
            "\n" +
            "    Note over Client,DB: 3. 更新日志流程\n" +
            "    Client->>+Service: PATCH /api/logs/123\n" +
            "    Service->>+DB: UPDATE特定字段\n" +
            "    DB-->>-Service: 更新成功\n" +
            "    Service-->>-Client: 200 OK (更新后记录)\n" +
            "\n" +
            "    Note over Client,DB: 4. 删除日志流程\n" +
            "    Client->>+Service: DELETE /api/logs/123\n" +
            "    Service->>+DB: DELETE物理删除\n" +
            "    DB-->>-Service: 删除确认\n" +
            "    Service-->>-Client: 204 No Content\n" +
            "```\n" +
            "\n" +
            "---\n" +
            "\n" +
            "## 库表设计\n" +
            "\n" +
            "```markdown\n" +
            "## 库表设计\n" +
            "\n" +
            "### 1. 操作日志主表 (operation_logs)\n" +
            "\n" +
            "| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 索引 | 描述 |\n" +
            "|--------|------|------|--------|--------|------|------|------|\n" +
            "| id | bigint | 20 | N | AUTO_INCREMENT | Y | PK | 自增主键 |\n" +
            "| operator | varchar | 64 | N |  |  | IDX_operator | 操作者标识(用户ID/系统标识) |\n" +
            "| operation | varchar | 32 | N |  |  | IDX_operation | 操作类型(CREATE/UPDATE/DELETE/LOGIN等) |\n" +
            "| target | varchar | 128 | N |  |  |  | 操作目标(资源URI/模块标识) |\n" +
            "| parameters | text |  | Y | NULL |  |  | 操作参数(JSON格式字符串) |\n" +
            "| result | varchar | 255 | Y | NULL |  |  | 操作结果(SUCCESS/FAILED+原因) |\n" +
            "| ip_address | varchar | 48 | Y | NULL |  | IDX_ip | 客户端IP(支持IPv6) |\n" +
            "| created_at | datetime |  | N | CURRENT_TIMESTAMP |  | IDX_time | 创建时间 |\n" +
            "| updated_at | datetime |  | N | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |  |  | 最后更新时间 |\n" +
            "\n" +
            "**索引设计：**\n" +
            "- 主键索引：PRIMARY KEY (id)\n" +
            "- 普通索引：\n" +
            "  - IDX_operator (operator)\n" +
            "  - IDX_operation (operation)\n" +
            "  - IDX_time (created_at)\n" +
            "  - IDX_ip (ip_address)\n" +
            "\n" +
            "**约束条件：**\n" +
            "- 字符集：UTF8MB4\n" +
            "- 存储引擎：InnoDB\n" +
            "- 行格式：COMPRESSED\n" +
            "- 外键：无\n" +
            "\n" +
            "\n" +
            "### 3. 字段详细说明\n" +
            "\n" +
            "**operator字段：**\n" +
            "- 存储格式：`<user_type>:<user_id>` (如: `employee:1001`)\n" +
            "- 特殊值：`system`表示系统自动操作\n" +
            "- 加密要求：如为敏感用户需加密存储\n" +
            "\n" +
            "**operation字段：**\n" +
            "- 预定义值枚举：\n" +
            "  - CREATE\n" +
            "  - READ \n" +
            "  - UPDATE\n" +
            "  - DELETE\n" +
            "  - LOGIN\n" +
            "  - LOGOUT\n" +
            "  - EXPORT\n" +
            "  - IMPORT\n" +
            "\n" +
            "**target字段：**\n" +
            "- 格式规范：`/<模块>/<资源>[/ID]` (如: `/iam/users/1001`)\n" +
            "- 最大深度限制：5级路径\n" +
            "\n" +
            "**parameters字段：**\n" +
            "- 存储格式：URL编码的JSON字符串\n" +
            "- 示例：`\"username=test&role=admin\"` 或 `{\"force\":true}`\n" +
            "- 大小限制：8KB\n" +
            "\n" +
            "### 4. 数据保留策略\n" +
            "- 自动清理任务：每日凌晨删除created_at超过180天的记录\n" +
            "- 备份策略：每日全量备份+binlog增量备份\n" +
            "\n" +
            "### 5. 性能优化措施\n" +
            "1. 冷热数据分离：\n" +
            "   - 近期数据(30天内)使用SSD存储\n" +
            "   - 历史数据迁移至HDD\n" +
            "\n" +
            "2. 查询优化：\n" +
            "   - 为常用查询组合建立复合索引\n" +
            "   - 大数据量查询强制使用created_at时间范围\n" +
            "\n" +
            "3. 写入优化：\n" +
            "   - 批量插入支持\n" +
            "   - 异步写缓冲队列\n" +
            "```\n" +
            "\n" +
            "---\n" +
            "\n" +
            "## API文档\n" +
            "\n" +
            "```markdown\n" +
            "```yaml\n" +
            "openapi: 3.0.0\n" +
            "info:\n" +
            "  title: 操作日志管理系统 API\n" +
            "  version: 1.0.0\n" +
            "  description: 提供操作日志的CRUD管理功能\n" +
            "\n" +
            "servers:\n" +
            "  - url: /api\n" +
            "    description: 主API服务端点\n" +
            "\n" +
            "paths:\n" +
            "  /logs:\n" +
            "    post:\n" +
            "      tags: [日志管理]\n" +
            "      summary: 创建操作日志\n" +
            "      description: 记录用户或系统的操作行为\n" +
            "      security:\n" +
            "        - BearerAuth: []\n" +
            "      requestBody:\n" +
            "        required: true\n" +
            "        content:\n" +
            "          application/json:\n" +
            "            schema:\n" +
            "              $ref: '#/components/schemas/LogCreateRequest'\n" +
            "      responses:\n" +
            "        '201':\n" +
            "          description: 日志创建成功\n" +
            "          content:\n" +
            "            application/json:\n" +
            "              schema:\n" +
            "                $ref: '#/components/schemas/LogDetail'\n" +
            "        '400':\n" +
            "          description: 无效的请求参数\n" +
            "        '401':\n" +
            "          description: 未授权访问\n" +
            "\n" +
            "    get:\n" +
            "      tags: [日志管理]\n" +
            "      summary: 查询操作日志\n" +
            "      description: 支持多条件筛选和分页查询\n" +
            "      security:\n" +
            "        - BearerAuth: []\n" +
            "      parameters:\n" +
            "        - $ref: '#/components/parameters/operatorParam'\n" +
            "        - $ref: '#/components/parameters/operationParam'\n" +
            "        - $ref: '#/components/parameters/startTimeParam'\n" +
            "        - $ref: '#/components/parameters/endTimeParam'\n" +
            "        - $ref: '#/components/parameters/pageParam'\n" +
            "        - $ref: '#/components/parameters/sizeParam'\n" +
            "      responses:\n" +
            "        '200':\n" +
            "          description: 查询成功\n" +
            "          content:\n" +
            "            application/json:\n" +
            "              schema:\n" +
            "                $ref: '#/components/schemas/LogListResponse'\n" +
            "        '401':\n" +
            "          description: 未授权访问\n" +
            "\n" +
            "  /logs/{id}:\n" +
            "    patch:\n" +
            "      tags: [日志管理]\n" +
            "      summary: 更新日志信息\n" +
            "      description: 仅允许更新结果字段和备注信息\n" +
            "      security:\n" +
            "        - BearerAuth: [admin]\n" +
            "      parameters:\n" +
            "        - $ref: '#/components/parameters/idParam'\n" +
            "      requestBody:\n" +
            "        required: true\n" +
            "        content:\n" +
            "          application/json:\n" +
            "            schema:\n" +
            "              $ref: '#/components/schemas/LogUpdateRequest'\n" +
            "      responses:\n" +
            "        '200':\n" +
            "          description: 更新成功\n" +
            "          content:\n" +
            "            application/json:\n" +
            "              schema:\n" +
            "                $ref: '#/components/schemas/LogDetail'\n" +
            "        '403':\n" +
            "          description: 权限不足\n" +
            "        '404':\n" +
            "          description: 日志不存在\n" +
            "\n" +
            "    delete:\n" +
            "      tags: [日志管理]\n" +
            "      summary: 删除操作日志\n" +
            "      description: 物理删除日志记录(需管理员权限)\n" +
            "      security:\n" +
            "        - BearerAuth: [admin]\n" +
            "      parameters:\n" +
            "        - $ref: '#/components/parameters/idParam'\n" +
            "      responses:\n" +
            "        '204':\n" +
            "          description: 删除成功\n" +
            "        '403':\n" +
            "          description: 权限不足\n" +
            "        '404':\n" +
            "          description: 日志不存在\n" +
            "\n" +
            "components:\n" +
            "  securitySchemes:\n" +
            "    BearerAuth:\n" +
            "      type: http\n" +
            "      scheme: bearer\n" +
            "      bearerFormat: JWT\n" +
            "\n" +
            "  parameters:\n" +
            "    idParam:\n" +
            "      name: id\n" +
            "      in: path\n" +
            "      required: true\n" +
            "      schema:\n" +
            "        type: integer\n" +
            "        format: int64\n" +
            "      description: 日志ID\n" +
            "    \n" +
            "    operatorParam:\n" +
            "      name: operator\n" +
            "      in: query\n" +
            "      required: false\n" +
            "      schema:\n" +
            "        type: string\n" +
            "      description: 操作者标识\n" +
            "    \n" +
            "    operationParam:\n" +
            "      name: operation\n" +
            "      in: query\n" +
            "      required: false\n" +
            "      schema:\n" +
            "        type: string\n" +
            "        enum: [CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, IMPORT]\n" +
            "      description: 操作类型\n" +
            "    \n" +
            "    startTimeParam:\n" +
            "      name: start\n" +
            "      in: query\n" +
            "      required: false\n" +
            "      schema:\n" +
            "        type: string\n" +
            "        format: date-time\n" +
            "      description: 开始时间(包含)\n" +
            "    \n" +
            "    endTimeParam:\n" +
            "      name: end\n" +
            "      in: query\n" +
            "      required: false\n" +
            "      schema:\n" +
            "        type: string\n" +
            "        format: date-time\n" +
            "      description: 结束时间(包含)\n" +
            "    \n" +
            "    pageParam:\n" +
            "      name: page\n" +
            "      in: query\n" +
            "      required: false\n" +
            "      schema:\n" +
            "        type: integer\n" +
            "        default: 0\n" +
            "      description: 页码(从0开始)\n" +
            "    \n" +
            "    sizeParam:\n" +
            "      name: size\n" +
            "      in: query\n" +
            "      required: false\n" +
            "      schema:\n" +
            "        type: integer\n" +
            "        default: 20\n" +
            "        maximum: 100\n" +
            "      description: 每页数量\n" +
            "\n" +
            "  schemas:\n" +
            "    LogCreateRequest:\n" +
            "      type: object\n" +
            "      required: [operator, operation, target]\n" +
            "      properties:\n" +
            "        operator:\n" +
            "          type: string\n" +
            "          maxLength: 64\n" +
            "          example: \"user:1001\"\n" +
            "        operation:\n" +
            "          type: string\n" +
            "          enum: [CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, IMPORT]\n" +
            "          example: \"DELETE\"\n" +
            "        target:\n" +
            "          type: string\n" +
            "          maxLength: 128\n" +
            "          example: \"/api/users/456\"\n" +
            "        parameters:\n" +
            "          type: string\n" +
            "          maxLength: 8192\n" +
            "          example: \"force=true\"\n" +
            "        ip_address:\n" +
            "          type: string\n" +
            "          maxLength: 48\n" +
            "          example: \"192.168.1.100\"\n" +
            "\n" +
            "    LogUpdateRequest:\n" +
            "      type: object\n" +
            "      properties:\n" +
            "        result:\n" +
            "          type: string\n" +
            "          maxLength: 255\n" +
            "          example: \"FAILED: permission denied\"\n" +
            "        parameters:\n" +
            "          type: string\n" +
            "          maxLength: 8192\n" +
            "          example: \"updated params\"\n" +
            "\n" +
            "    LogDetail:\n" +
            "      type: object\n" +
            "      properties:\n" +
            "        id:\n" +
            "          type: integer\n" +
            "          format: int64\n" +
            "          example: 123\n" +
            "        operator:\n" +
            "          type: string\n" +
            "          example: \"user:1001\"\n" +
            "        operation:\n" +
            "          type: string\n" +
            "          example: \"DELETE\"\n" +
            "        target:\n" +
            "          type: string\n" +
            "          example: \"/api/users/456\"\n" +
            "        parameters:\n" +
            "          type: string\n" +
            "          example: \"force=true\"\n" +
            "        result:\n" +
            "          type: string\n" +
            "          example: \"SUCCESS\"\n" +
            "        ip_address:\n" +
            "          type: string\n" +
            "          example: \"192.168.1.100\"\n" +
            "        created_at:\n" +
            "          type: string\n" +
            "          format: date-time\n" +
            "        updated_at:\n" +
            "          type: string\n" +
            "          format: date-time\n" +
            "\n" +
            "    LogListResponse:\n" +
            "      type: object\n" +
            "      properties:\n" +
            "        content:\n" +
            "          type: array\n" +
            "          items:\n" +
            "            $ref: '#/components/schemas/LogDetail'\n" +
            "        page:\n" +
            "          type: integer\n" +
            "          example: 0\n" +
            "        size:\n" +
            "          type: integer\n" +
            "          example: 20\n" +
            "        totalElements:\n" +
            "          type: integer\n" +
            "          example: 100\n" +
            "        totalPages:\n" +
            "          type: integer\n" +
            "          example: 5\n" +
            "```\n" +
            "\n" +
            "---\n" +
            "\n" +
            "## 类图\n" +
            "\n" +
            "```mermaid\n" +
            "classDiagram\n" +
            "    class OperationLogService {\n" +
            "        +createLog(LogCreateRequest request) LogDetail\n" +
            "        +getLogs(LogQuery query) LogListResponse\n" +
            "        +updateLog(Long id, LogUpdateRequest request) LogDetail\n" +
            "        +deleteLog(Long id) void\n" +
            "        -validateCreateRequest(LogCreateRequest request) void\n" +
            "        -convertToEntity(LogCreateRequest request) OperationLog\n" +
            "        -convertToDetail(OperationLog entity) LogDetail\n" +
            "    }\n" +
            "\n" +
            "    class OperationLogController {\n" +
            "        +create(LogCreateRequest request) ResponseEntity~LogDetail~\n" +
            "        +list(LogQuery query) ResponseEntity~LogListResponse~\n" +
            "        +update(Long id, LogUpdateRequest request) ResponseEntity~LogDetail~\n" +
            "        +delete(Long id) ResponseEntity~Void~\n" +
            "    }\n" +
            "\n" +
            "    class OperationLogRepository {\n" +
            "        +save(OperationLog entity) OperationLog\n" +
            "        +findById(Long id) Optional~OperationLog~\n" +
            "        +findByCriteria(LogSpecification spec, Pageable pageable) Page~OperationLog~\n" +
            "        +deleteById(Long id) void\n" +
            "    }\n" +
            "\n" +
            "    class OperationLog {\n" +
            "        -Long id\n" +
            "        -String operator\n" +
            "        -String operation\n" +
            "        -String target\n" +
            "        -String parameters\n" +
            "        -String result\n" +
            "        -String ipAddress\n" +
            "        -LocalDateTime createdAt\n" +
            "        -LocalDateTime updatedAt\n" +
            "        +getId() Long\n" +
            "        +getOperator() String\n" +
            "        +getOperation() String\n" +
            "        +getTarget() String\n" +
            "        +getParameters() String\n" +
            "        +getResult() String\n" +
            "        +getIpAddress() String\n" +
            "        +getCreatedAt() LocalDateTime\n" +
            "        +getUpdatedAt() LocalDateTime\n" +
            "        +updateResult(String result) void\n" +
            "    }\n" +
            "\n" +
            "    class LogCreateRequest {\n" +
            "        -String operator\n" +
            "        -String operation\n" +
            "        -String target\n" +
            "        -String parameters\n" +
            "        -String ipAddress\n" +
            "        +getOperator() String\n" +
            "        +getOperation() String\n" +
            "        +getTarget() String\n" +
            "        +getParameters() String\n" +
            "        +getIpAddress() String\n" +
            "    }\n" +
            "\n" +
            "    class LogUpdateRequest {\n" +
            "        -String result\n" +
            "        -String parameters\n" +
            "        +getResult() String\n" +
            "        +getParameters() String\n" +
            "    }\n" +
            "\n" +
            "    class LogQuery {\n" +
            "        -String operator\n" +
            "        -String operation\n" +
            "        -LocalDateTime start\n" +
            "        -LocalDateTime end\n" +
            "        -Integer page\n" +
            "        -Integer size\n" +
            "        +getOperator() String\n" +
            "        +getOperation() String\n" +
            "        +getStart() LocalDateTime\n" +
            "        +getEnd() LocalDateTime\n" +
            "        +getPage() Integer\n" +
            "        +getSize() Integer\n" +
            "        +toPageable() Pageable\n" +
            "    }\n" +
            "\n" +
            "    class LogDetail {\n" +
            "        -Long id\n" +
            "        -String operator\n" +
            "        -String operation\n" +
            "        -String target\n" +
            "        -String parameters\n" +
            "        -String result\n" +
            "        -String ipAddress\n" +
            "        -LocalDateTime createdAt\n" +
            "        -LocalDateTime updatedAt\n" +
            "    }\n" +
            "\n" +
            "    class LogListResponse {\n" +
            "        -List~LogDetail~ content\n" +
            "        -Integer page\n" +
            "        -Integer size\n" +
            "        -Long totalElements\n" +
            "        -Integer totalPages\n" +
            "    }\n" +
            "\n" +
            "    class LogSpecification {\n" +
            "        -LogQuery query\n" +
            "        +toPredicate(Root~OperationLog~ root, CriteriaQuery~?~ query, CriteriaBuilder cb) Predicate\n" +
            "    }\n" +
            "\n" +
            "    OperationLogService --> OperationLogRepository : depends on\n" +
            "    OperationLogService --> OperationLog : creates/updates\n" +
            "    OperationLogService --> LogDetail : produces\n" +
            "    OperationLogService --> LogListResponse : produces\n" +
            "    OperationLogController --> OperationLogService : depends on\n" +
            "    OperationLogRepository --> OperationLog : manages\n" +
            "    OperationLogRepository --> LogSpecification : uses for query\n" +
            "    LogSpecification --> LogQuery : based on\n" +
            "    LogDetail <-- OperationLog : mapped from\n" +
            "    LogListResponse --> LogDetail : contains\n" +
            "```\n" +
            "\n" +
            "---\n" +
            "\n";
    /**
     * 测试 1：LLM 返回 "Yes" 的情况
     * 预期结果：shouldGenerateFrontend 返回 true
     */
//    @Test
//    public void testShouldGenerateFrontend_Yes() throws Exception {
//        PromptTemplate promptTemplate = new PromptTemplate("请分析以下设计文档，判断是否需要生成前端代码。\n\n设计文档内容：\n{design_document_content}\n\n回答 \"Yes\" 表示需要生成前端代码，回答 \"No\" 表示不需要。");
//        Map<String, Object> promptParameters = new HashMap<>();
//        promptParameters.put("design_document_content", designDocumentContent);
//
//        Prompt prompt = promptTemplate.create(promptParameters);
//        ChatClient build = ChatClient.builder(new ChatModel() {
//            @Override
//            public ChatResponse call(Prompt prompt) {
//                return null;
//            }
//        }).build();
//        OpenAiChatOptions openAiChatOptions = OpenAiChatOptions.builder()
//                .model("deepseek-chat")
//                .build();
//
//        ChatClient chatClient = chatClientBuilder.defaultOptions(openAiChatOptions).build();
//
//        try {
//            ChatResponse chatResponse = chatClient.prompt(prompt)
//                    .user("User: 请分析设计文档是否需要生成前端代码，并仅以 Yes 或 No 回答。")
//                    .call()
//                    .chatResponse();
//
//            String responseContent = chatResponse.getResult().getOutput().getText().trim();
//            return "Yes".equalsIgnoreCase(responseContent);
//        } catch (Exception e) {
//            System.err.println("Error during LLM call for determining frontend generation requirement: " + e.getMessage());
//            e.printStackTrace();
//            return false; // 默认不生成前端代码
//        }
//    }

}
