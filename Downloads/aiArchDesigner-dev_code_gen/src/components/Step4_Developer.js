import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Spin, Row, Col, message, Tabs, Space, Tooltip, Upload, Collapse } from 'antd';
import { InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

// Helper function for downloading files
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function Step4_Developer({ architectOutput, onConfirm, codeSnippets }) {
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [uploadedDesignDoc, setUploadedDesignDoc] = useState(null);

  useEffect(() => {
    // Reset when architect output changes
    setCode(null);
    setLoading(false);
    setIsConfirmed(false);
    setUploadedDesignDoc(null);
  }, [architectOutput]);

  const handleFileUpload = (file) => {
    // Handle file upload logic here
    // For now, just store the file info. In a real app, you might upload it to a server.
    setUploadedDesignDoc(file);
    message.success(`${file.name} 文件上传成功。`);
    return false; // Prevent default upload behavior
  };

  const generateCode = async () => {
    if (!architectOutput && !uploadedDesignDoc) {
      message.warning('请先完成技术设计或上传设计文档!');
      return;
    }
    setLoading(true);
    setIsConfirmed(false);
    setCode(null);

    const formData = new FormData();
    let designDocumentName = 'design_document.txt';

    if (uploadedDesignDoc) {
      formData.append('designDocument', uploadedDesignDoc, uploadedDesignDoc.name);
      designDocumentName = uploadedDesignDoc.name;
    } else if (architectOutput) {
      try {
        const architectOutputString = JSON.stringify(architectOutput, null, 2);
        const architectOutputBlob = new Blob([architectOutputString], { type: 'application/json' });
        formData.append('designDocument', architectOutputBlob, 'architect_design_output.json');
        designDocumentName = 'architect_design_output.json';
      } catch (error) {
        message.error('序列化技术设计输出时出错: ' + error.message);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:8080/api/code-generation/generate-from-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ content: '无法解析错误响应' }));
        // Handle specific error structure from backend if filename is "error"
        const errorMessage = (Array.isArray(errorData) && errorData.length > 0 && errorData[0].filename === 'error') 
                           ? errorData[0].content
                           : `请求失败: ${response.status} ${response.statusText || ''}. ${errorData.content || ''}`.trim();
        message.error(`AI 代码生成失败: ${errorMessage}`);
        setLoading(false);
        return;
      }

      const generatedFiles = await response.json();
      let processedCode = { frontend: null, backend: null };
      let serverError = null;

      if (!Array.isArray(generatedFiles)) {
        message.error('从服务器接收到的响应格式不正确。');
        setLoading(false);
        return;
      }

      generatedFiles.forEach(file => {
        if (file.filename === 'error' && file.content) {
          serverError = file.content;
          return; 
        }
      });

      if (serverError) {
        message.error(`AI代码生成出错: ${serverError}`);
        setCode(null); 
        setLoading(false);
        setIsConfirmed(false); 
        return;
      }
      
      let filesCategorized = false;
      generatedFiles.forEach(file => {
        const fNameLower = file.filename.toLowerCase();
        if (fNameLower.includes('frontend') || fNameLower.match(/\\.(js|jsx|html|css|ts|tsx)$/)) {
          if (!processedCode.frontend) {
            processedCode.frontend = file.content;
            filesCategorized = true;
          }
        } else if (fNameLower.includes('backend') || fNameLower.match(/\\.(java|py|go|cs|php|rb|kt|swift)$/)) {
          if (!processedCode.backend) {
            processedCode.backend = file.content;
            filesCategorized = true;
          }
        }
      });

      // Fallback if no specific files found by name/extension, but some general files exist
      if (!filesCategorized && generatedFiles.length > 0) {
        if (generatedFiles.length === 1) { 
          processedCode.frontend = generatedFiles[0].content; 
        } else if (generatedFiles.length >= 2) { 
          processedCode.frontend = generatedFiles[0].content; 
          processedCode.backend = generatedFiles[1].content;  
        }
      }
      
      processedCode.frontend = processedCode.frontend || (generatedFiles.length > 0 ? "<未能识别匹配的前端代码>" : "<AI 未返回任何前端代码文件>");
      processedCode.backend = processedCode.backend || (generatedFiles.length > 0 ? "<未能识别匹配的后端代码>" : "<AI 未返回任何后端代码文件>");

      if (generatedFiles.length === 0 || (generatedFiles.length === 1 && generatedFiles[0].filename === 'error' && !serverError) ) {
         message.info("AI 未返回可用的代码文件。");
      } else if (!serverError) {
         message.success('AI 已成功生成代码示例!');
      }

      setCode(processedCode);
      setIsConfirmed(true); 
      if (onConfirm) {
        onConfirm(processedCode);
      }

    } catch (error) {
      console.error("Error generating code:", error);
      message.error('调用AI代码生成接口时发生网络或未知错误: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

   const handleDownload = (type) => {
     if (!code) {
         message.warning('请先生成代码示例!');
         return;
     }
     if (type === 'frontend' && code.frontend) {
         downloadFile(code.frontend, 'frontend_example.js', 'text/javascript;charset=utf-8');
     } else if (type === 'backend' && code.backend) {
         downloadFile(code.backend, 'backend_example.js', 'text/javascript;charset=utf-8');
     } else {
          message.error('无法下载指定的代码类型。');
     }
   };

   const tabItems = code ? [
    { key: 'frontend', label: '前端代码示例', children: <Paragraph><pre>{code.frontend}</pre></Paragraph> },
    { key: 'backend', label: '后端代码示例', children: <Paragraph><pre>{code.backend}</pre></Paragraph> },
  ] : [];

  const renderArchitectOutput = () => {
    if (!architectOutput) return <Paragraph>没有来自上一阶段的技术设计信息。</Paragraph>;

    const {
      designKeyPoints,
      highLevelDesign,
      detailedDesign,
      uploadedRequirementsFile,
      isHighLevelDesignSkipped
    } = architectOutput;

    return (
      <Collapse bordered={false} defaultActiveKey={['key-points']}>
        {uploadedRequirementsFile && uploadedRequirementsFile.name && (
          <Panel header="已上传的需求文档" key="uploaded-req-file">
            <Paragraph>文件名: {uploadedRequirementsFile.name}</Paragraph>
          </Panel>
        )}
        {designKeyPoints && (
          <Panel header="设计要点" key="key-points">
            <Paragraph>{designKeyPoints}</Paragraph>
          </Panel>
        )}
        {!isHighLevelDesignSkipped && highLevelDesign && (
          <Panel header="高阶设计" key="high-level">
            <Tabs defaultActiveKey="1" type="card">
              {Object.entries(highLevelDesign).map(([key, value]) => (
                value && value.content && (
                  <Tabs.TabPane tab={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} key={key}>
                    <Paragraph><pre>{value.content}</pre></Paragraph>
                    {value.aiAdjustmentRequest && <Paragraph>AI调整请求: {value.aiAdjustmentRequest}</Paragraph>}
                  </Tabs.TabPane>
                )
              ))}
            </Tabs>
          </Panel>
        )}
        {detailedDesign && (
          <Panel header="详细设计" key="detailed-design">
             <Tabs defaultActiveKey="1" type="card">
              {Object.entries(detailedDesign).map(([key, value]) => (
                value && value.content && (
                  <Tabs.TabPane tab={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} key={key}>
                    <Paragraph><pre>{value.content}</pre></Paragraph>
                    {value.aiAdjustmentRequest && <Paragraph>AI调整请求: {value.aiAdjustmentRequest}</Paragraph>}
                  </Tabs.TabPane>
                )
              ))}
            </Tabs>
          </Panel>
        )}
      </Collapse>
    );
  };

  return (
    <div>
      <Title level={4}>开发实现</Title>
      <Card title="输入依据：技术设计" style={{ marginBottom: 16 }} extra={
        <Upload beforeUpload={handleFileUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />}>上传设计文档 (可选)</Button>
        </Upload>
      }>
        {uploadedDesignDoc && (
          <Paragraph>
            已上传设计文档: {uploadedDesignDoc.name} (AI 将优先使用此文档)
          </Paragraph>
        )}
        <Collapse accordion ghost>
            <Panel header="查看已确认的技术设计" key="1">
                {renderArchitectOutput()}
            </Panel>
        </Collapse>
        {(!architectOutput && !uploadedDesignDoc) && (
             <Paragraph>请先完成"技术设计"步骤或上传您自己的设计文档。</Paragraph>
        )}
       </Card>

       <Space wrap style={{ marginBottom: 16 }}>
        <Button onClick={generateCode} disabled={loading || isConfirmed || (!architectOutput && !uploadedDesignDoc)} type="primary">
          {loading ? <Spin size="small" /> : (isConfirmed ? '代码已生成' : 'AI 生成代码')}
        </Button>
        {isConfirmed && code && (
            <Button onClick={() => handleDownload('frontend')}>
               下载前端代码
            </Button>
        )}
        {isConfirmed && code && (
             <Button onClick={() => handleDownload('backend')}>
               下载后端代码
            </Button>
        )}
        {isConfirmed && (
            <Button onClick={generateCode}>重新生成</Button>
        )}
      </Space>

      {loading && (
          <Spin tip="AI 正在生成代码示例...">
             <div style={{minHeight: '50px', padding: '20px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px'}}>
                 <Paragraph style={{color: 'gray', fontSize: '0.9em'}}>
                    正在分析技术设计文档... 
                     <Tooltip title={architectOutput ? Object.keys(architectOutput).map(key => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(', ') : "无技术设计"}>\n                        <InfoCircleOutlined style={{ marginLeft: '8px', cursor: 'help' }} />
                     </Tooltip>
                </Paragraph>
            </div>
          </Spin>
      )}

      {isConfirmed && code && (
         <Tabs
            defaultActiveKey="frontend"
            items={tabItems}
          />
      )}

      {isConfirmed && code && (
          <Paragraph style={{marginTop: '16px', color: 'gray'}}>
              提示：此为 AI 生成的代码示例，仅供参考。开发人员可基于此进行实际开发。
          </Paragraph>
      )}
    </div>
  );
}

export default Step4_Developer; 