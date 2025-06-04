export const mockData = {
  userRequirement: ``,
  prd: {
    content: '',
    isConfirmed: false,
  },
  architectDesignData: {
    uploadedRequirementsFile: null,
    designKeyPoints: '',
    isHighLevelDesignSkipped: false,
    highLevelDesign: {
      moduleBreakdown: {
//        content: '# 高层设计 - 模块划分\n\n基于需求，系统初步划分为以下主要模块：\n1.  **用户表示层 (User Interface Layer):** 处理用户交互，例如Web界面。\n2.  **应用服务层 (Application Service Layer):** 编排核心业务逻辑，处理用例。\n3.  **领域层 (Domain Layer):** 包含核心业务模型、实体、值对象和领域服务。\n4.  **基础设施层 (Infrastructure Layer):** 提供通用技术能力，如数据库访问、消息传递、第三方服务集成等。',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 高层设计 - 模块划分 (AI调整后)\n\n根据您的指示，调整模块划分如下：\n1.  **用户表示层 (User Interface Layer):** 处理用户交互，例如Web界面和移动App接口。\n2.  **API网关层 (API Gateway Layer):** 新增，作为所有请求的统一入口，负责路由、认证、限流。\n3.  **应用服务层 (Application Service Layer):** 编排核心业务逻辑，处理用例。\n4.  **领域层 (Domain Layer):** 包含核心业务模型、实体、值对象和领域服务。\n5.  **基础设施层 (Infrastructure Layer):** 提供通用技术能力，如数据库访问、消息传递、第三方服务集成等。\n6.  **监控与日志模块 (Monitoring & Logging):** 新增，负责系统健康状况监控和日志收集。'
      },
      appComponentBreakdown: {
//        content: '# 高层设计 - 应用/组件划分\n\n主要应用/组件包括：\n-   **证书管理Web应用 (CertificateManagementWebApp):** 前端用户界面。\n-   **证书管理API服务 (CertificateManagementAPIService):** 后端核心服务，提供RESTful API。\n-   **数据库 (CertificateDB):** 存储所有证书及相关信息。\n-   **(可选) 消息队列 (MessageQueue):** 用于异步任务处理，如通知。',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 高层设计 - 应用/组件划分 (AI调整后)\n\n进一步细化应用/组件：\n-   **证书管理Web应用 (CertificateManagementWebApp):** 前端，React SPA。\n-   **证书管理API服务 (CertificateManagementAPIService):** 后端核心，Node.js + Express。\n-   **用户认证服务 (AuthService):** 独立微服务，负责用户身份验证。\n-   **通知服务 (NotificationService):** 独立微服务，处理邮件和短信通知。\n-   **关系型数据库 (PostgreSQL - CertificateDB):** 存储结构化数据。\n-   **文档数据库 (MongoDB - AuditLogDB):** 存储审计日志。\n-   **消息队列 (RabbitMQ):** 用于服务间异步通信。'
      },
      appComponentCollaboration: {
//        content: '# 高层设计 - 应用/组件协作关系\n\n1.  用户通过 **WebApp** 与系统交互。\n2.  **WebApp** 调用 **APIService** 完成业务操作。\n3.  **APIService** 读写 **CertificateDB**。\n4.  **APIService** (可选) 通过 **MessageQueue** 发送通知。\n```mermaid\ngraph TD\n    User --> WebApp;\n    WebApp --> APIService;\n    APIService --> CertificateDB;\n    APIService -.-> MessageQueue;\n```',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 高层设计 - 应用/组件协作关系 (AI调整后)\n\n更新后的协作图：\n1.  用户通过 **WebApp** 与系统交互。\n2.  **WebApp** 的请求首先到达 **API网关**。\n3.  **API网关** 路由请求到 **APIService** 或 **AuthService**。\n4.  **APIService** 可能调用 **AuthService** 进行权限校验。\n5.  **APIService** 和 **AuthService** 读写各自的数据库，并通过 **MessageQueue** 与 **NotificationService** 通信。\n```mermaid\ngraph TD\n    User --> WebApp;\n    WebApp --> APIGateway;\n    APIGateway --> APIService;\n    APIGateway --> AuthService;\n    APIService --> PostgreSQL;\n    AuthService --> UserDB; \n    APIService --> RabbitMQ;\n    RabbitMQ --> NotificationService;\n```'
      },
      deploymentDiagram: {
//        content: '# 高层设计 - 部署图\n\n初步设想部署方案：\n-   **WebApp** 和 **APIService** 容器化部署 (例如 Docker)。\n-   **CertificateDB** 可以使用云数据库服务。\n```mermaid\n    graph LR\n    subgraph "用户侧"\n        Browser\n    end\n    subgraph "云平台 / 数据中心"\n        subgraph "Kubernetes / Docker Swarm"\n            WebAppContainer[WebApp Docker 容器] --> APIServiceContainer[APIService Docker 容器];\n        end\n        APIServiceContainer --> CloudDB[云数据库 PostgreSQL];\n    end\n    Browser --> WebAppContainer;\n```',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 高层设计 - 部署图 (AI调整后)\n\n更详细的容器化部署方案 (Kubernetes示例)：\n```mermaid\n    graph TD\n    subgraph "用户设备"\n        client[客户端浏览器/App]\n    end\n    subgraph "DMZ区"\n        lb[负载均衡器/API网关]\n    end\n    subgraph "应用集群 (Kubernetes)"\n        direction LR\n        pod1[WebApp Pod replicas] --> svc_web[WebApp Service]\n        pod2[APIService Pod replicas] --> svc_api[APIService Service]\n        pod3[AuthService Pod replicas] --> svc_auth[AuthService Service]\n        pod4[NotificationService Pod replicas] --> svc_notify[NotificationService Service]\n    end\n    subgraph "数据存储层"\n        direction LR\n        db_pg[PostgreSQL Cluster]\n        db_mongo[MongoDB Cluster]\n        mq[RabbitMQ Cluster]\n    end\n    client --> lb;\n    lb --> svc_web;\n    lb --> svc_api;\n    lb --> svc_auth;\n    svc_web --> svc_api;\n    svc_api --> db_pg;\n    svc_api --> mq;\n    svc_auth --> UserDB_placeholder[User DB]; \n    svc_notify --> ExternalSMSEmail[外部SMS/Email网关];\n    mq --> svc_notify;\n    svc_api --> db_mongo; \n```'
      }
    },
    detailedDesign: {
      keySequenceDiagram: {
//        content: '# 详细设计 - 关键时序图 (用户上传证书流程)\n\n```mermaid\nsequenceDiagram\n    participant User\n    participant WebApp\n    participant APIService\n    participant CertificateDB\n\n    User->>WebApp: 填写证书信息并提交\n    WebApp->>APIService: POST /api/certificates (证书数据)\n    APIService->>APIService: 校验数据合法性\n    alt 数据有效\n        APIService->>CertificateDB: 保存证书信息\n        CertificateDB-->>APIService: 保存成功\n        APIService-->>WebApp: {success: true, id: newCertId}\n        WebApp-->>User: 显示成功信息\n    else 数据无效\n        APIService-->>WebApp: {success: false, error: \'校验失败\'}\n        WebApp-->>User: 显示错误信息\n    end\n```',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 详细设计 - 关键时序图 (用户上传证书流程 - AI调整加入异步通知)\n\n```mermaid\nsequenceDiagram\n    participant User\n    participant WebApp\n    participant APIService\n    participant CertificateDB\n    participant MessageQueue\n    participant NotificationService\n\n    User->>WebApp: 填写证书信息并提交\n    WebApp->>APIService: POST /api/certificates (证书数据)\n    APIService->>APIService: 校验数据合法性\n    alt 数据有效\n        APIService->>CertificateDB: 保存证书信息\n        CertificateDB-->>APIService: 保存成功, 返回 newCertId\n        APIService->>MessageQueue: publish (事件: CERT_UPLOADED, data: {certId: newCertId})\n        APIService-->>WebApp: {success: true, id: newCertId}\n        WebApp-->>User: 显示成功信息\n        MessageQueue->>NotificationService: consume (事件: CERT_UPLOADED)\n        NotificationService->>NotificationService: 发送邮件/短信通知相关人员\n    else 数据无效\n        APIService-->>WebApp: {success: false, error: \'校验失败\'}\n        WebApp-->>User: 显示错误信息\n    end\n```'
      },
      stateDiagram: {
//        content: '# 详细设计 - 状态图 (证书状态)\n\n```mermaid\nstateDiagram-v2\n    [*] --> PendingApproval : 开发人员上传\n    PendingApproval --> Approved : 运维人员审核通过 (上架)\n    PendingApproval --> Rejected : 运维人员审核拒绝\n    Approved --> Active : 自动 (例如，到达生效日期，或立即生效)\n    Active --> ExpiringSoon : 临近到期日\n    Active --> Revoked : 运维人员吊销 (下架)\n    ExpiringSoon --> Expired : 到期后自动\n    ExpiringSoon --> Renewed : 更新证书后\n    Revoked --> [*]\n    Rejected --> [*]\n    Expired --> [*]\n    Renewed --> Active : (类似Approved到Active的流程)\n```',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 详细设计 - 状态图 (证书状态 - 简化版)\n\n```mermaid\nstateDiagram-v2\n    [*] --> Draft : 开发人员上传\n    Draft --> InReview : 提交审核\n    InReview --> Published : 运维上架\n    InReview --> Rejected : 审核拒绝\n    Published --> Archived : 运维下架/过期\n    Rejected --> Draft : 退回修改\n    Archived --> [*]\n```'
      },
      dbDesign: {
//        content: '# 详细设计 - 库表设计\n\n**Table: certificates**\n- id (PK, UUID)\n- name (VARCHAR(255))\n- domain (VARCHAR(255))\n- issuer (VARCHAR(255))\n- valid_from (TIMESTAMP)\n- valid_to (TIMESTAMP)\n- status (VARCHAR(50))  -- e.g., Pending, Active, Expired, Revoked\n- created_at (TIMESTAMP)\n- updated_at (TIMESTAMP)\n- responsible_person (VARCHAR(100))\n- raw_certificate_pem (TEXT, nullable)\n- raw_private_key_pem (TEXT, nullable, encrypted)\n\n**Table: certificate_sans** (Subject Alternative Names)\n- id (PK, UUID)\n- certificate_id (FK to certificates.id)\n- san_value (VARCHAR(255))\n\n**Table: audit_logs**\n- id (PK, UUID)\n- certificate_id (FK, nullable)\n- action (VARCHAR(100)) -- e.g., created, updated, status_changed\n- user_id (VARCHAR(100), nullable)\n- timestamp (TIMESTAMP)\n- details (JSONB)\n',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 详细设计 - 库表设计 (AI调整 - 增加团队关联和标签)\n\n**Table: teams**\n- id (PK, UUID)\n- name (VARCHAR(100), UNIQUE)\n- created_at (TIMESTAMP)\n\n**Table: certificates**\n- id (PK, UUID)\n- team_id (FK to teams.id) -- 新增，关联团队\n- name (VARCHAR(255))\n- ... (其他字段同上) ...\n- tags (JSONB, nullable) -- 新增，用于标签化管理\n\n...(其他表结构类似，audit_logs可增加team_id的记录)'
      },
      apiDocs: {
//        content: '# 详细设计 - API文档\n\n**POST /api/v1/certificates**\n- Description: 创建新证书记录\n- Request Body: (JSON) { name, domain, issuer, valid_from, valid_to, responsible_person, pem?, key? }\n- Response: (201 Created) { id, ... } or (400 Bad Request) { error }\n\n**GET /api/v1/certificates**\n- Description: 获取证书列表 (支持分页和过滤)\n- Query Params: page, limit, status, domain_contains, sort_by (e.g., valid_to_asc)\n- Response: (200 OK) { data: [...], pagination: {...} }\n\n**GET /api/v1/certificates/{id}**\n- Description: 获取单个证书详情\n- Response: (200 OK) { ... } or (404 Not Found)\n\n**PUT /api/v1/certificates/{id}**\n- Description: 更新证书信息\n- Request Body: (JSON) { fields_to_update }\n- Response: (200 OK) { ... } or (404 Not Found)\n\n**PATCH /api/v1/certificates/{id}/status**\n- Description: 更新证书状态 (例如，上架、下架)\n- Request Body: (JSON) { status: \'active\' | \'revoked\' }\n- Response: (200 OK) { ... } or (400 Bad Request) { error }\n\n**DELETE /api/v1/certificates/{id}**\n- Description: 删除证书\n- Response: (204 No Content) or (404 Not Found)\n',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 详细设计 - API文档 (AI调整 - 增加按标签查询和批量操作)\n\n**GET /api/v1/certificates**\n- Query Params: ..., tags_include_any (comma separated), tags_include_all (comma separated)\n\n**POST /api/v1/certificates/batch-status**\n- Description: 批量更新证书状态\n- Request Body: (JSON) { ids: [...], status: \'new_status\' }\n- Response: (200 OK) { success_count, failed_count, details: [...] }\n\n**(其他API保持不变或按需调整)**'
      },
      classDiagram: {
//        content: '# 详细设计 - 类图\n\n(初步设想，基于DDD)\n```mermaid\nclassDiagram\n    class CertificateRepository {\n        +save(Certificate): void\n        +findById(UUID): Certificate\n        +findAll(criteria): List<Certificate>\n    }\n    class Certificate {\n        -id: UUID\n        -name: String\n        -domainInfo: DomainInfo\n        -validityPeriod: ValidityPeriod\n        -status: CertificateStatus\n        +changeStatus(newStatus): void\n        +updateDetails(...): void\n        +isExpired(): boolean\n    }\n    class DomainInfo {\n        -primaryDomain: String\n        -sans: List<String>\n    }\n    class ValidityPeriod {\n        -validFrom: Date\n        -validTo: Date\n    }\n    enum CertificateStatus {\n        PENDING\n        ACTIVE\n        EXPIRED\n        REVOKED\n    }\n    Certificate "1" *-- "1" DomainInfo\n    Certificate "1" *-- "1" ValidityPeriod\n    Certificate "1" *-- "1" CertificateStatus\n    CertificateRepository ..> Certificate : uses\n```',
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
//        adjustedContent: '# 详细设计 - 类图 (AI调整 - 增加事件和领域服务)\n\n```mermaid\nclassDiagram\n    class CertificateRepository { ... }\n    class Certificate { ... }\n    class DomainInfo { ... }\n    class ValidityPeriod { ... }\n    enum CertificateStatus { ... }\n\n    class CertificateService {\n        +uploadCertificate(dto): Certificate\n        +renewCertificate(id, newValidTo): Certificate\n        +revokeCertificate(id): void\n    }\n    CertificateService ..> CertificateRepository : uses\n    CertificateService ..> CertificateDomainEventPublisher : uses\n\n    class CertificateDomainEventPublisher {\n        +publish(event: DomainEvent): void\n    }\n    abstract class DomainEvent {\n        timestamp: Date\n    }\n    class CertificateCreatedEvent extends DomainEvent { certificateId: UUID }\n    class CertificateRenewedEvent extends DomainEvent { certificateId: UUID }\n    class CertificateRevokedEvent extends DomainEvent { certificateId: UUID }\n\n    Certificate "1" *-- "1" DomainInfo\n    Certificate "1" *-- "1" ValidityPeriod\n    Certificate "1" *-- "1" CertificateStatus\n    CertificateRepository ..> Certificate : uses\n```'
      },
      designDocument: {
        content:'',
        aiAdjustmentRequest: '',
        adjustedContent: '',
      }
    },
    isConfirmed: false
  },
  codeSnippets: {
    frontend: `// React component example\nimport React, { useState, useEffect } from \'react\';\n\nfunction PetList() {\n  const [pets, setPets] = useState([]);\n\n  useEffect(() => {\n    // Fetch pets from API\n    // fetch(\'/api/pets\').then(res => res.json()).then(data => setPets(data));\n    setPets([{ id: 1, name: \'Buddy\', type: \'Dog\' }]); // Mock data\n  }, []);\n\n  return (\n    <div>\n      <h2>Available Pets</h2>\n      <ul>\n        {pets.map(pet => (\n          <li key={pet.id}>{pet.name} ({pet.type})</li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n\nexport default PetList;\n`,
    backend: `// Node.js/Express example route\nconst express = require(\'express\');\nconst router = express.Router();\n\n// Mock pet data\nconst pets = [{ id: 1, name: \'Buddy\', type: \'Dog\' }];\n\nrouter.get(\'/api/pets\', (req, res) => {\n  res.json(pets);\n});\n\nmodule.exports = router;\n`
  }
};
