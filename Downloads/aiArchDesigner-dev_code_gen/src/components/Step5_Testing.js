import React from 'react';
import { Typography, Alert, Card } from 'antd';

const { Title, Paragraph } = Typography;

function Step5_Testing({ developerCode }) {
  return (
    <div>
      <Title level={4}>测试</Title>
      <Paragraph>
        此阶段基于"开发实现"阶段生成的代码进行测试。
      </Paragraph>

      <Card title="开发产物 (代码示例)" style={{ marginBottom: 16 }}>
        {developerCode ? (
          <Paragraph style={{ maxHeight: '200px', overflowY: 'auto' }}>
             代码已生成。 (实际测试流程会在此处进行，例如运行单元测试、集成测试、展示测试报告等)
             {/* Example: Displaying a snippet */}
             <pre style={{ background: '#f5f5f5', padding: '8px' }}>
                 {/* Display a short snippet or summary */}
                 {developerCode.frontend?.substring(0, 200) + '...'} 
             </pre>
          </Paragraph>
        ) : (
          <Paragraph>请先完成"开发实现"步骤以生成代码。</Paragraph>
        )}
      </Card>

      <Alert 
        message="测试流程说明"
        description="在此 POC 中，测试步骤仅作流程展示。实际平台中，这里会集成自动化测试工具、展示测试结果、允许手动测试用例执行和记录等。"
        type="info"
        showIcon
      />
    </div>
  );
}

export default Step5_Testing; 