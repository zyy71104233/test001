# 代码规范指南

## 1. 通用规范
### 1.1 命名规范
#### 文件命名
- 组件文件：PascalCase.tsx
- 工具文件：camelCase.ts
- 样式文件：kebab-case.scss
- 常量文件：UPPER_SNAKE_CASE.ts

#### 变量命名
```typescript
// 普通变量
const userName = 'John';

// 布尔值
const isVisible = true;
const hasPermission = false;

// 常量
const MAX_COUNT = 100;
const API_BASE_URL = 'https://api.example.com';

// 接口
interface UserInfo {
    id: string;
    name: string;
}

// 类型
type ButtonSize = 'small' | 'medium' | 'large';
```

### 1.2 代码组织
```typescript
// 导入顺序
import React from 'react';                          // React相关
import { useSelector, useDispatch } from 'redux';   // 第三方库
import { Button } from 'antd';                      // UI组件库
import { UserService } from '@/services';           // 业务服务
import { formatDate } from '@/utils';               // 工具函数
import styles from './index.module.scss';           // 样式文件

// 组件结构
const Component: React.FC<Props> = (props) => {
    // 1. Hooks
    // 2. 状态管理
    // 3. 计算属性
    // 4. 事件处理
    // 5. 渲染函数
    return (
        <div>
            {/* JSX */}
        </div>
    );
};
```

## 2. 前端规范
### 2.1 React组件规范
```typescript
// 函数组件
const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
    // 使用hooks
    const [loading, setLoading] = useState(false);

    // 事件处理
    const handleUpdate = async () => {
        try {
            setLoading(true);
            await onUpdate();
        } finally {
            setLoading(false);
        }
    };

    // 条件渲染
    if (!user) {
        return <div>用户不存在</div>;
    }

    return (
        <div>
            {/* 组件内容 */}
        </div>
    );
};
```

### 2.2 状态管理规范
```typescript
// Redux Action
const UPDATE_USER = 'user/update';

interface UpdateUserAction {
    type: typeof UPDATE_USER;
    payload: UserInfo;
}

// Redux Reducer
const userReducer = (state = initialState, action: UserAction) => {
    switch (action.type) {
        case UPDATE_USER:
            return {
                ...state,
                user: action.payload
            };
        default:
            return state;
    }
};
```

### 2.3 样式规范
```scss
// 组件样式
.component {
    // 布局
    display: flex;
    align-items: center;

    // 变量使用
    color: var(--primary-color);
    font-size: var(--font-size-md);

    // 子元素
    &-header {
        margin-bottom: 16px;
    }

    // 状态
    &--active {
        background-color: #e6f7ff;
    }
}
```

## 3. 后端规范
### 3.1 接口规范
```typescript
// 接口定义
interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

// 请求处理
async function handleRequest<T>(
    request: Request,
    response: Response
): Promise<ApiResponse<T>> {
    try {
        // 请求处理逻辑
        return {
            code: 200,
            message: 'success',
            data: result
        };
    } catch (error) {
        return {
            code: 500,
            message: error.message,
            data: null
        };
    }
}
```

### 3.2 数据库操作规范
```typescript
// 数据库操作
class UserRepository {
    // 查询单条记录
    async findById(id: string): Promise<User | null> {
        return await this.db.user.findUnique({
            where: { id }
        });
    }

    // 批量操作
    async batchUpdate(users: User[]): Promise<void> {
        await this.db.$transaction(async (tx) => {
            for (const user of users) {
                await tx.user.update({
                    where: { id: user.id },
                    data: user
                });
            }
        });
    }
}
```

## 4. 测试规范
### 4.1 单元测试
```typescript
describe('UserService', () => {
    // 测试前准备
    beforeEach(() => {
        // 初始化测试环境
    });

    // 测试用例
    it('should update user profile', async () => {
        // 准备测试数据
        const user = {
            id: '1',
            name: 'John'
        };

        // 执行测试
        const result = await userService.update(user);

        // 验证结果
        expect(result).toBeDefined();
        expect(result.name).toBe('John');
    });
});
```

### 4.2 集成测试
```typescript
describe('User API', () => {
    it('should handle user creation', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                name: 'John',
                email: 'john@example.com'
            });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('id');
    });
});
```

## 5. 文档规范
### 5.1 注释规范
```typescript
/**
 * 用户服务类
 * @class UserService
 */
class UserService {
    /**
     * 更新用户信息
     * @param {UserInfo} user - 用户信息
     * @returns {Promise<UserInfo>} 更新后的用户信息
     * @throws {Error} 更新失败时抛出错误
     */
    async updateUser(user: UserInfo): Promise<UserInfo> {
        // 实现逻辑
    }
}
```

### 5.2 README规范
```markdown
# 项目名称

## 项目描述
简要描述项目的功能和目的

## 安装说明
详细的安装步骤和依赖说明

## 使用说明
主要功能的使用方法和示例

## 开发指南
开发环境搭建和开发流程说明

## 部署说明
部署步骤和注意事项
```

## 6. 版本控制规范
### 6.1 Git提交规范
```bash
# 提交格式
<type>(<scope>): <subject>

# 类型说明
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 6.2 分支管理
- master: 主分支，用于生产环境
- develop: 开发分支
- feature/*: 功能分支
- hotfix/*: 紧急修复分支
- release/*: 发布分支

## 7. 安全规范
### 7.1 数据安全
```typescript
// 敏感数据加密
const encryptData = (data: string): string => {
    // 使用加密算法
    return encrypted;
};

// 参数校验
const validateInput = (input: unknown): boolean => {
    // 输入验证逻辑
    return isValid;
};
```

### 7.2 认证授权
```typescript
// 权限检查
const checkPermission = async (
    user: User,
    resource: string
): Promise<boolean> => {
    // 权限检查逻辑
    return hasPermission;
};
```

## 8. 性能规范
### 8.1 前端性能
1. 资源加载优化
2. 渲染性能优化
3. 状态管理优化
4. 网络请求优化

### 8.2 后端性能
1. 数据库查询优化
2. 缓存策略
3. 并发处理
4. 资源管理 