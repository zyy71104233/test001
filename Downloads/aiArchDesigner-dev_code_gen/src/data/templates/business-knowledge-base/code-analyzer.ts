import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface BusinessProcess {
    id: string;
    name: string;
    domain: string;
    description: string;
    steps: ProcessStep[];
    rules: string[];
}

interface ProcessStep {
    name: string;
    input: string[];
    output: string[];
    rules: string[];
}

interface BusinessRule {
    id: string;
    name: string;
    type: string;
    description: string;
    implementation: string;
}

interface BusinessComponent {
    id: string;
    name: string;
    type: string;
    props: ComponentProp[];
    methods: ComponentMethod[];
    events: ComponentEvent[];
}

interface ComponentProp {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

interface ComponentMethod {
    name: string;
    params: string[];
    returnType: string;
    description: string;
}

interface ComponentEvent {
    name: string;
    params: string[];
    description: string;
}

class BusinessKnowledgeExtractor {
    private processes: BusinessProcess[] = [];
    private rules: BusinessRule[] = [];
    private components: BusinessComponent[] = [];

    constructor(private rootDir: string) {}

    /**
     * 分析整个项目源码
     */
    async analyzeProject() {
        await this.scanDirectory(this.rootDir);
        await this.generateDocumentation();
    }

    /**
     * 递归扫描目录
     */
    private async scanDirectory(dir: string) {
        const files = await fs.promises.readdir(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = await fs.promises.stat(fullPath);
            
            if (stat.isDirectory()) {
                await this.scanDirectory(fullPath);
            } else if (this.isTypeScriptFile(file)) {
                await this.analyzeFile(fullPath);
            }
        }
    }

    /**
     * 分析单个文件
     */
    private async analyzeFile(filePath: string) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            filePath,
            content,
            ts.ScriptTarget.Latest,
            true
        );

        this.extractBusinessLogic(sourceFile);
    }

    /**
     * 提取业务逻辑
     */
    private extractBusinessLogic(sourceFile: ts.SourceFile) {
        ts.forEachChild(sourceFile, node => {
            // 分析组件
            if (this.isReactComponent(node)) {
                this.extractComponent(node);
            }
            
            // 分析业务规则
            if (this.isBusinessRule(node)) {
                this.extractRule(node);
            }
            
            // 分析业务流程
            if (this.isBusinessProcess(node)) {
                this.extractProcess(node);
            }
        });
    }

    /**
     * 判断是否为React组件
     */
    private isReactComponent(node: ts.Node): boolean {
        if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
            // 检查是否返回JSX
            return this.containsJSX(node);
        }
        return false;
    }

    /**
     * 检查节点是否包含JSX
     */
    private containsJSX(node: ts.Node): boolean {
        let hasJSX = false;
        ts.forEachChild(node, child => {
            if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
                hasJSX = true;
            }
        });
        return hasJSX;
    }

    /**
     * 提取组件信息
     */
    private extractComponent(node: ts.Node) {
        const component: BusinessComponent = {
            id: `C${this.components.length + 1}`.padStart(3, '0'),
            name: this.getNodeName(node),
            type: 'React Component',
            props: this.extractProps(node),
            methods: this.extractMethods(node),
            events: this.extractEvents(node)
        };
        
        this.components.push(component);
    }

    /**
     * 提取组件属性
     */
    private extractProps(node: ts.Node): ComponentProp[] {
        const props: ComponentProp[] = [];
        // 分析接口或类型定义
        ts.forEachChild(node, child => {
            if (ts.isInterfaceDeclaration(child) && child.name.text.includes('Props')) {
                child.members.forEach(member => {
                    if (ts.isPropertySignature(member)) {
                        props.push({
                            name: member.name.getText(),
                            type: member.type?.getText() || 'any',
                            required: !member.questionToken,
                            description: this.getJsDocDescription(member)
                        });
                    }
                });
            }
        });
        return props;
    }

    /**
     * 提取组件方法
     */
    private extractMethods(node: ts.Node): ComponentMethod[] {
        const methods: ComponentMethod[] = [];
        ts.forEachChild(node, child => {
            if (ts.isMethodDeclaration(child) || ts.isFunctionDeclaration(child)) {
                methods.push({
                    name: child.name?.getText() || '',
                    params: this.getMethodParams(child),
                    returnType: child.type?.getText() || 'void',
                    description: this.getJsDocDescription(child)
                });
            }
        });
        return methods;
    }

    /**
     * 提取组件事件
     */
    private extractEvents(node: ts.Node): ComponentEvent[] {
        const events: ComponentEvent[] = [];
        ts.forEachChild(node, child => {
            if (ts.isPropertyDeclaration(child) && child.name.getText().startsWith('on')) {
                events.push({
                    name: child.name.getText(),
                    params: this.getEventParams(child),
                    description: this.getJsDocDescription(child)
                });
            }
        });
        return events;
    }

    /**
     * 生成文档
     */
    private async generateDocumentation() {
        await this.generateProcessLibrary();
        await this.generateRuleLibrary();
        await this.generateComponentLibrary();
    }

    /**
     * 生成业务流程文档
     */
    private async generateProcessLibrary() {
        let content = '# 业务流程知识库\n\n';
        content += '## 1. 核心业务流程目录\n';
        
        // 添加流程索引
        content += '### 1.2 流程索引\n';
        content += '| 流程ID | 流程名称 | 业务域 | 重要程度 | 更新时间 | 状态 |\n';
        content += '|--------|----------|--------|-----------|----------|------|\n';
        
        this.processes.forEach(process => {
            content += `| ${process.id} | ${process.name} | ${process.domain} | 高 | ${new Date().toISOString().split('T')[0]} | 活跃 |\n`;
        });

        // 添加流程详情
        this.processes.forEach(process => {
            content += `\n## 2. 业务流程详情\n`;
            content += `### ${process.name}\n`;
            content += `#### 基本信息\n`;
            content += `- **流程ID**: ${process.id}\n`;
            content += `- **业务域**: ${process.domain}\n`;
            // ... 其他流程信息
        });

        await fs.promises.writeFile(
            path.join(this.rootDir, 'business-knowledge-base/business-process-library.md'),
            content
        );
    }

    /**
     * 生成业务规则文档
     */
    private async generateRuleLibrary() {
        let content = '# 业务规则知识库\n\n';
        // ... 生成规则文档内容
        await fs.promises.writeFile(
            path.join(this.rootDir, 'business-knowledge-base/business-rules-library.md'),
            content
        );
    }

    /**
     * 生成组件库文档
     */
    private async generateComponentLibrary() {
        let content = '# 业务组件库\n\n';
        // ... 生成组件文档内容
        await fs.promises.writeFile(
            path.join(this.rootDir, 'business-knowledge-base/business-components-library.md'),
            content
        );
    }

    // 辅助方法
    private getNodeName(node: ts.Node): string {
        if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
            return node.name?.getText() || 'Anonymous';
        }
        return 'Anonymous';
    }

    private getMethodParams(node: ts.FunctionLikeDeclaration): string[] {
        return node.parameters.map(param => param.getText());
    }

    private getEventParams(node: ts.PropertyDeclaration): string[] {
        if (node.type && ts.isFunctionTypeNode(node.type)) {
            return node.type.parameters.map(param => param.getText());
        }
        return [];
    }

    private getJsDocDescription(node: ts.Node): string {
        const jsDoc = ts.getJSDocTags(node);
        if (jsDoc.length > 0) {
            return jsDoc[0].getText();
        }
        return '';
    }

    private isBusinessRule(node: ts.Node): boolean {
        // 检查是否包含@businessRule注解
        const jsDoc = ts.getJSDocTags(node);
        return jsDoc.some(tag => tag.tagName.getText() === 'businessRule');
    }

    private isBusinessProcess(node: ts.Node): boolean {
        // 检查是否包含@businessProcess注解
        const jsDoc = ts.getJSDocTags(node);
        return jsDoc.some(tag => tag.tagName.getText() === 'businessProcess');
    }

    private isTypeScriptFile(fileName: string): boolean {
        return fileName.endsWith('.ts') || fileName.endsWith('.tsx');
    }
}

// 使用示例
const analyzer = new BusinessKnowledgeExtractor('./src');
analyzer.analyzeProject().catch(console.error); 