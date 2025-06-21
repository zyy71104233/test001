import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Typography,
  message,
  Upload,
  Input,
  Space,
  Divider,
  Steps,
  Collapse,
  Checkbox,
  Row,
  Col,
  Alert,
  Tabs,
  Tooltip,
  Spin,
  Layout,
} from 'antd';
import { UploadOutlined, DownloadOutlined, EditOutlined, CheckOutlined, CloseOutlined, RobotOutlined, SaveOutlined, ArrowLeftOutlined, ArrowRightOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { produce } from 'immer'; // For easier state updates
import { generateStreamContent } from '../services/llmService'; // Import LLM service
import { getAIAdjustmentPrompt, getInitialArtifactGenerationPrompt } from '../prompts/architectPrompts'; // Import prompt templates

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Content } = Layout; // Corrected: Destructure Content directly from Layout

// --- Helper function for downloading text files ---
const downloadTextFile = (content, filename, mimeType = 'text/plain;charset=utf-8') => {
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


// --- Define design sections and artifacts ---
const HIGH_LEVEL_DESIGN_ARTIFACTS = {
  moduleBreakdown: '模块划分',
  appComponentBreakdown: '应用/组件划分',
  appComponentCollaboration: '应用/组件协作关系',
  deploymentDiagram: '部署图',
};
const highLevelArtifactKeys = Object.keys(HIGH_LEVEL_DESIGN_ARTIFACTS);

const DETAILED_DESIGN_ARTIFACTS = {
  fileList: '文件列表',
  keySequenceDiagram: '关键时序图',
  stateDiagram: '状态图',
  dbDesign: '库表设计',
  apiDocs: 'API文档',
  classDiagram: '类图',
  designDocument: '设计文档',
};
const detailedArtifactKeys = Object.keys(DETAILED_DESIGN_ARTIFACTS);

const ALL_ARTIFACT_KEYS = [...highLevelArtifactKeys, ...detailedArtifactKeys];
const TAB_KEYS = ['entry', 'highLevel', 'detailed'];

function Step3_Architect({ prd, onConfirm, initialDesignData, currentDesignData, setDesignData }) {
  const [activeTab, setActiveTab] = useState(TAB_KEYS[0]);
  const [editingArtifact, setEditingArtifact] = useState(null);
  const [aiAdjustmentInput, setAiAdjustmentInput] = useState('');

  const [currentHighLevelStep, setCurrentHighLevelStep] = useState(0);
  const [currentDetailedStep, setCurrentDetailedStep] = useState(0);
  const [isAIGenerating, setIsAIGenerating] = useState(null); // {type, key}

  useEffect(() => {
    if (!currentDesignData || ALL_ARTIFACT_KEYS.every(key =>
        (!currentDesignData.highLevelDesign[key]?.content && !currentDesignData.detailedDesign[key]?.content)
    )) {
      setDesignData(JSON.parse(JSON.stringify(initialDesignData)));
    }
  }, [initialDesignData, setDesignData]);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setDesignData(produce(currentDesignData, draft => {
        draft.uploadedRequirementsFile = { name: file.name, content: e.target.result };
      }));
      message.success(`${file.name} 文件上传成功。`);
    };
    reader.readAsText(file);
    return false;
  };

  const handleDesignKeyPointsChange = (e) => {
    const { value } = e.target;
    setDesignData(produce(currentDesignData, draft => {
      draft.designKeyPoints = value;
    }));
  };
  
  const handleSkipHighLevelChange = (e) => {
    const skipped = e.target.checked;
    setDesignData(produce(currentDesignData, draft => {
      draft.isHighLevelDesignSkipped = skipped;
    }));
    if (skipped) {
        message.info('高层设计已跳过，将直接进入详细设计。');
        setActiveTab(TAB_KEYS[2]); // detailed
    } else {
        // If unskipping, and currently on detailed, might want to go to highLevel
        if (activeTab === TAB_KEYS[2]) setActiveTab(TAB_KEYS[1]); // highLevel
    }
  };

  const startEditing = (type, key, currentContent) => {
    setEditingArtifact({ type, key, content: currentContent });
    setAiAdjustmentInput('');
  };

  const handleEditorChange = (e) => {
    if (editingArtifact) {
      setEditingArtifact({ ...editingArtifact, content: e.target.value });
    }
  };

  const saveEdit = () => {
    if (editingArtifact) {
      const { type, key, content } = editingArtifact;
      setDesignData(produce(currentDesignData, draft => {
        const designGroup = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
        designGroup[key].content = content;
      }));
      message.success(`${getArtifactLabel(type, key)} 已保存!`);
      setEditingArtifact(null);
    }
  };

  const cancelEdit = () => {
    setEditingArtifact(null);
  };

  const handleAIAdjustmentInputChange = (e) => {
    setAiAdjustmentInput(e.target.value);
  };

  const submitAIAdjustment = async (type, key) => {
    if (!aiAdjustmentInput.trim()) {
      message.warning('请输入AI调整指令!');
      return;
    }

    const artifactLabel = getArtifactLabel(type, key);
    const designGroup = type === 'highLevel' ? currentDesignData.highLevelDesign : currentDesignData.detailedDesign;
    const originalContent = designGroup[key].content;

    // Use imported prompt template function
    const prompt = getAIAdjustmentPrompt(artifactLabel, originalContent, aiAdjustmentInput);

    // Log the prompt to the console
    console.log(
      `[LLM Prompt - Step3_Architect - Adjust Artifact - ${type}/${key}]:`,
      prompt
    );

    setIsAIGenerating({ type, key });
    setDesignData(produce(currentDesignData, draft => {
        const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
        groupToUpdate[key].content = '';
        groupToUpdate[key].aiAdjustmentRequest = aiAdjustmentInput;
    }));

    let accumulatedContent = '';
    try {
      await generateStreamContent(
        prompt,
        (chunk) => {
          accumulatedContent += chunk;
          setDesignData(produce(draft => {
            const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
            groupToUpdate[key].content = accumulatedContent;
          }));
        },
        (processedContent) => {
          setIsAIGenerating(null);
          if (processedContent) {
            message.success(`AI 已完成调整 ${artifactLabel}!`);
          } else {
            message.warn(`AI调整结束，但未返回有效内容 for ${artifactLabel}。请检查指令或稍后重试。`);
          }
          setAiAdjustmentInput('');
          if (editingArtifact && editingArtifact.type === type && editingArtifact.key === key) {
            setEditingArtifact(prev => ({ ...prev, content: accumulatedContent }));
          }
        },
        (error) => {
          setIsAIGenerating(null);
          console.error('LLM Stream Error:', error);
          message.error(`AI 调整 ${artifactLabel} 失败: ${error.message}`);
          setDesignData(produce(draft => {
            const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
            groupToUpdate[key].content = originalContent; 
          }));
        }
      );
    } catch (error) {
        setIsAIGenerating(null);
        console.error('Error calling generateStreamContent:', error);
        message.error(`调用AI服务时发生错误 for ${artifactLabel}: ${error.message}`);
        setDesignData(produce(draft => {
          const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
          groupToUpdate[key].content = originalContent; 
        }));
    }
  };

  const handleInitialAIGenerate = async (type, key) => {
    const artifactLabel = getArtifactLabel(type, key);
    const prdContent = currentDesignData.uploadedRequirementsFile?.content || prd || '';
    const designKeyPoints = currentDesignData.designKeyPoints || '';

    // 如果是设计文档节点，需要汇总所有设计内容
    let prompt;
    if (key === 'designDocument') {
      // 收集所有已有的设计内容
      let allDesignContent = '';
      
      // 添加设计要点
      if (designKeyPoints) {
        allDesignContent += `## 设计要点\n${designKeyPoints}\n\n`;
      }

      // 添加高层设计内容
      if (!currentDesignData.isHighLevelDesignSkipped) {
        allDesignContent += '# 高层设计\n\n';
        for (const hlKey in HIGH_LEVEL_DESIGN_ARTIFACTS) {
          if (currentDesignData.highLevelDesign[hlKey]?.content) {
            allDesignContent += `## ${HIGH_LEVEL_DESIGN_ARTIFACTS[hlKey]}\n`;
            allDesignContent += currentDesignData.highLevelDesign[hlKey].content;
            allDesignContent += '\n\n';
          }
        }
      }

      // 添加详细设计内容
      allDesignContent += '# 详细设计\n\n';
      for (const dtKey in DETAILED_DESIGN_ARTIFACTS) {
        if (dtKey !== 'designDocument' && currentDesignData.detailedDesign[dtKey]?.content) {
          allDesignContent += `## ${DETAILED_DESIGN_ARTIFACTS[dtKey]}\n`;
          allDesignContent += currentDesignData.detailedDesign[dtKey].content;
          allDesignContent += '\n\n';
        }
      }

      prompt = `请基于以下现有的设计内容，生成一个完整的、结构清晰的技术设计文档。文档应该包含所有必要的章节，并确保内容的连贯性和完整性。如果发现任何设计上的缺失或不一致，请适当补充和调整。

现有设计内容：
${allDesignContent}

请生成一个格式规范的Markdown文档，包含：
1. 文档标题和简介
2. 设计目标和原则
3. 系统整体架构
4. 详细设计说明
5. 关键技术决策
6. 安全性考虑
7. 扩展性设计
8. 部署说明

请确保文档结构清晰，各部分内容衔接自然，并突出重点内容。`;
    } else {
      prompt = getInitialArtifactGenerationPrompt(
        artifactLabel,
        type,
        key,
        prdContent,
        designKeyPoints,
        currentDesignData.highLevelDesign,
        currentDesignData.detailedDesign,
        currentDesignData.isHighLevelDesignSkipped
      );
    }

    // Log the prompt to the console
    console.log(
      `[LLM Prompt - Step3_Architect - Generate Artifact - ${type}/${key}]:`,
      prompt
    );
    
    const designGroup = type === 'highLevel' ? currentDesignData.highLevelDesign : currentDesignData.detailedDesign;
    const originalContentOnError = designGroup[key]?.content || ''; 

    setIsAIGenerating({ type, key });
    setDesignData(produce(currentDesignData, draft => {
      const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
      if (!groupToUpdate[key]) {
        groupToUpdate[key] = { content: '', aiAdjustmentRequest: '' };
      }
      groupToUpdate[key].content = ''; // Clear for streaming effect
    }));

    let accumulatedContent = '';
    try {
      await generateStreamContent(prompt, (chunk) => {
        accumulatedContent += chunk;
        setDesignData(produce(draft => {
          const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
          groupToUpdate[key].content = accumulatedContent;
        }));
      }, (processedContent) => { // onComplete
        setIsAIGenerating(null);
        if (processedContent) {
          message.success(`AI 已成功生成 ${artifactLabel}!`);
        } else {
          message.warn(`AI生成结束，但未返回有效内容 for ${artifactLabel}。`);
          setDesignData(produce(draft => {
            const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
            groupToUpdate[key].content = originalContentOnError;
          }));
        }
      }, (error) => { // onError
        setIsAIGenerating(null);
        console.error(`LLM Stream Error (Initial Generation for ${type}/${key}):`, error);
        message.error(`AI 生成 ${artifactLabel} 失败: ${error.message}`);
        setDesignData(produce(draft => {
          const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
          groupToUpdate[key].content = originalContentOnError; 
        }));
      });
    } catch (error) { 
      setIsAIGenerating(null);
      console.error(`Error calling generateStreamContent (Initial Generation for ${type}/${key}):`, error);
      message.error(`调用AI服务生成 ${artifactLabel} 时发生错误: ${error.message}`);
      setDesignData(produce(draft => {
        const groupToUpdate = type === 'highLevel' ? draft.highLevelDesign : draft.detailedDesign;
        groupToUpdate[key].content = originalContentOnError;
      }));
    }
  };

  const getArtifactLabel = (type, key) => {
    if (type === 'highLevel' && HIGH_LEVEL_DESIGN_ARTIFACTS[key]) return HIGH_LEVEL_DESIGN_ARTIFACTS[key];
    if (type === 'detailed' && DETAILED_DESIGN_ARTIFACTS[key]) return DETAILED_DESIGN_ARTIFACTS[key];
    return key;
  };

  const renderArtifactCard = (type, key) => {
    const designGroup = type === 'highLevel' ? currentDesignData.highLevelDesign : currentDesignData.detailedDesign;
    const artifact = designGroup?.[key];
    const isLoading = isAIGenerating && isAIGenerating.type === type && isAIGenerating.key === key;

    if (!currentDesignData || !designGroup) {
        return <Alert message="设计数据正在加载或初始化..." type="info" showIcon />;
    }
    if (!artifact) return <Text type="secondary">此设计产物 (\`${key}\`) 数据未加载。</Text>;

    const label = getArtifactLabel(type, key);
    const mockDataForTooltip = initialDesignData[type === 'highLevel' ? 'highLevelDesign' : 'detailedDesign']?.[key]?.content || '无可用mock数据';

    // Show AI Generate button for all high-level AND detailed design artifacts if content is empty
    const showInitialGenerationButton = (type === 'highLevel' || type === 'detailed') && !artifact.content;
    // Show mock data tooltip for all high-level AND detailed design artifacts
    const showMockDataTooltip = (type === 'highLevel' || type === 'detailed');

    return (
      <Card 
        key={key} 
        style={{ marginTop: 16 }}
        title={isLoading ? <Space><Spin size="small" /> {label} (AI 正在生成...)</Space> : label}
        extra={
            <Space>
                {showMockDataTooltip && !isLoading && (
                    <Tooltip title={<pre style={{whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY:'auto'}}>{mockDataForTooltip}</pre>} placement="left">
                        <Button size="small" icon={<InfoCircleOutlined />} />
                    </Tooltip>
                )}
                {showInitialGenerationButton && !isLoading && (
                    <Button 
                        type="primary"
                        size="small" 
                        icon={<RobotOutlined />}
                        onClick={() => handleInitialAIGenerate(type, key)}
                    >
                        AI生成内容
                    </Button>
                )}
                {!isLoading && editingArtifact?.key !== key && artifact.content && (
                <Button icon={<EditOutlined />} onClick={() => startEditing(type, key, artifact.content)}>
                    编辑
                </Button>
                )}
            </Space>
        }
      >
        {editingArtifact?.key === key && editingArtifact?.type === type ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              rows={10}
              value={editingArtifact.content}
              onChange={handleEditorChange}
              disabled={isLoading}
            />
            <Space>
              <Button type="primary" icon={<SaveOutlined />} onClick={saveEdit} disabled={isLoading}>保存</Button>
              <Button icon={<CloseOutlined />} onClick={cancelEdit} disabled={isLoading}>取消</Button>
            </Space>
          </Space>
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: '300px', overflowY: 'auto', background: isLoading && !artifact.content ? '#f0f0f0' : (artifact.content ? '#f9f9f9' : '#fff'), padding: '8px', border: '1px solid #eee', minHeight: artifact.content ? 'auto' : '100px' }}>
            {isLoading && !artifact.content ? <Text type="secondary">(AI 正在生成内容...)</Text> : (artifact.content || <Text type="secondary">(内容为空，可使用上方 "AI生成内容" 或手动 "编辑")</Text>)}
          </pre>
        )}
        
        <Divider dashed />
        <Paragraph strong style={{marginTop: 10}}>自然语言AI调整:</Paragraph>
        <TextArea
          rows={2}
          placeholder={artifact.content ? `例如：请为 ${label} 增加关于XX的描述...` : '请先通过AI生成或手动编辑填充内容后再进行调整。'}
          value={(editingArtifact?.key === key && editingArtifact?.type === type) ? editingArtifact.aiAdjustmentInput : aiAdjustmentInput}
          onChange={handleAIAdjustmentInputChange}
          disabled={isLoading || !artifact.content || (editingArtifact && (editingArtifact.key !== key || editingArtifact.type !== type))}
        />
        <Button 
            type="primary"
            icon={<RobotOutlined />} 
            onClick={() => submitAIAdjustment(type, key)} 
            style={{ marginTop: 8 }}
            loading={isLoading}
            disabled={!artifact.content || (editingArtifact && (editingArtifact.key !== key || editingArtifact.type !== type))}
        >
          {isLoading ? 'AI 处理中...' : '提交给AI调整'}
        </Button>
        {artifact.aiAdjustmentRequest && !isLoading && (
            <Paragraph style={{marginTop: 8, fontSize: '0.9em', color: 'gray'}}>
                <Text strong>上次AI调整指令: </Text>{artifact.aiAdjustmentRequest}
            </Paragraph>
        )}
      </Card>
    );
  };
  
  const handleConfirmStep = () => {
    setDesignData(produce(currentDesignData, draft => {
        draft.isConfirmed = true;
    }));
    onConfirm(currentDesignData);
    message.success('技术设计阶段已确认!');
  };

  const exportDesignDocument = (type) => {
    let content = "";
    let filename = "";
    const designDataToExport = type === 'highLevel' ? currentDesignData.highLevelDesign : currentDesignData.detailedDesign;
    const artifactsToExport = type === 'highLevel' ? HIGH_LEVEL_DESIGN_ARTIFACTS : DETAILED_DESIGN_ARTIFACTS;

    // 如果是设计文档节点，生成完整的设计文档
    if (type === 'detailed' && designDataToExport.designDocument?.content) {
      content = designDataToExport.designDocument.content;
      filename = '完整设计文档.md';
    } else {
      content += `# 技术设计文档 - ${type === 'highLevel' ? '高层设计' : '详细设计'}\n\n`;
      if (currentDesignData.uploadedRequirementsFile?.name) {
          content += `## 关联需求文档: ${currentDesignData.uploadedRequirementsFile.name}\n\n`;
      }
      if (currentDesignData.designKeyPoints) {
          content += `## 设计要点:\n${currentDesignData.designKeyPoints}\n\n`;
      }

      for (const key in artifactsToExport) {
        if (designDataToExport[key]?.content) {
          content += `## ${artifactsToExport[key]}\n\n`;
          content += designDataToExport[key].content;
          content += `\n\n---\n\n`;
        }
      }
      filename = type === 'highLevel' ? '高层架构设计文档.md' : '详细设计文档.md';
    }
    
    downloadTextFile(content, filename, 'text/markdown;charset=utf-8');
    message.success(`${filename} 已开始下载。`);
  };

  if (!currentDesignData || !currentDesignData.highLevelDesign || !currentDesignData.detailedDesign) {
    return <Spin tip="加载设计数据中..." style={{ display: 'block', marginTop: 50 }} />;
  }
  
  const navigateInnerStep = (type, direction) => {
    if (type === 'highLevel') {
        setCurrentHighLevelStep(prev => {
            const nextStep = prev + direction;
            if (nextStep >= 0 && nextStep < highLevelArtifactKeys.length) {
                return nextStep;
            }
            return prev;
        });
    } else if (type === 'detailed') {
        setCurrentDetailedStep(prev => {
            const nextStep = prev + direction;
            if (nextStep >= 0 && nextStep < detailedArtifactKeys.length) {
                // 如果是从类图(倒数第二个节点)进入设计文档(最后一个节点)
                if (nextStep === detailedArtifactKeys.length - 1 && direction > 0 && 
                    detailedArtifactKeys[nextStep - 1] === 'classDiagram') {
                    // 直接拼接所有内容
                    let fullContent = '# 完整技术设计文档\n\n';
                    
                    // 添加设计要点
                    if (currentDesignData.designKeyPoints) {
                        fullContent += `## 设计要点\n${currentDesignData.designKeyPoints}\n\n`;
                    }

                    // 添加高层设计内容
                    if (!currentDesignData.isHighLevelDesignSkipped) {
                        fullContent += '# 高层设计\n\n';
                        for (const hlKey in HIGH_LEVEL_DESIGN_ARTIFACTS) {
                            if (currentDesignData.highLevelDesign[hlKey]?.content) {
                                fullContent += `## ${HIGH_LEVEL_DESIGN_ARTIFACTS[hlKey]}\n`;
                                fullContent += currentDesignData.highLevelDesign[hlKey].content;
                                fullContent += '\n\n';
                            }
                        }
                    }

                    // 添加详细设计内容
                    fullContent += '# 详细设计\n\n';
                    for (const dtKey in DETAILED_DESIGN_ARTIFACTS) {
                        if (dtKey !== 'designDocument' && currentDesignData.detailedDesign[dtKey]?.content) {
                            fullContent += `## ${DETAILED_DESIGN_ARTIFACTS[dtKey]}\n`;
                            fullContent += currentDesignData.detailedDesign[dtKey].content;
                            fullContent += '\n\n';
                        }
                    }

                    // 更新设计文档内容
                    setDesignData(produce(currentDesignData, draft => {
                        if (!draft.detailedDesign.designDocument) {
                            draft.detailedDesign.designDocument = { content: '', aiAdjustmentRequest: '' };
                        }
                        draft.detailedDesign.designDocument.content = fullContent;
                    }));
                }
                return nextStep;
            }
            return prev;
        });
    }
  };

  // Check for entry condition for enabling next step from 'entry' tab
  const canProceedFromEntry = true; // (currentDesignData.uploadedRequirementsFile?.content || (prd && prd.trim() !== '') || (currentDesignData.designKeyPoints && currentDesignData.designKeyPoints.trim() !== ''));

  return (
    <Layout style={{ background: '#fff' }}> {/* Removed Sider */}
        <Content style={{ padding: '24px', minHeight: 280 }}> {/* Adjusted padding */}
            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                <TabPane tab="1. 设计入口" key={TAB_KEYS[0]}>
                    <Title level={4}>设计阶段入口</Title>
                    <Collapse ghost style={{ marginBottom: 16 }}>
                        <Panel header="已确认的需求分析 (PRD) - 点击展开/折叠" key="prd-summary">
                            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: '150px', overflowY: 'auto', background: '#fafafa', padding: '8px' }}>
                                {prd || 'PRD内容未加载，请先完成需求分析步骤。'}
                            </pre>
                        </Panel>
                    </Collapse>
                    <Row gutter={16} style={{marginBottom: 16}}>
                        <Col xs={24} md={12}>
                            <Card title="上传需求文档 (可选)" size="small">
                                <Upload beforeUpload={handleFileUpload} showUploadList={false} accept=".txt,.md,.doc,.docx,.pdf">
                                <Button icon={<UploadOutlined />}>点击上传需求文档</Button>
                                </Upload>
                                {currentDesignData.uploadedRequirementsFile && (
                                <Paragraph style={{ marginTop: 10, fontSize: '0.9em' }}>
                                    已上传: <Text strong>{currentDesignData.uploadedRequirementsFile.name}</Text>
                                    <Tooltip title="查看内容 (部分预览)">
                                        <Button type="link" icon={<FileTextOutlined />} onClick={() => message.info(currentDesignData.uploadedRequirementsFile.content.substring(0,500) + '...')}/>
                                    </Tooltip>
                                </Paragraph>
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="设计要点 (可选)" size="small">
                                <TextArea
                                rows={5}
                                placeholder="请输入本次设计的核心目标、关键约束、技术选型考虑等..."
                                value={currentDesignData.designKeyPoints}
                                onChange={handleDesignKeyPointsChange}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Checkbox 
                        checked={currentDesignData.isHighLevelDesignSkipped} 
                        onChange={handleSkipHighLevelChange}
                    >
                        跳过高层设计 (若系统较简单，可直接进入详细设计)
                    </Checkbox>
                    <div style={{marginTop: 20, textAlign: 'right'}}>
                        <Button 
                            type="primary" 
                            icon={<ArrowRightOutlined />} 
                            onClick={() => setActiveTab(currentDesignData.isHighLevelDesignSkipped ? TAB_KEYS[2] : TAB_KEYS[1])} 
                            disabled={!canProceedFromEntry}
                        >
                            {currentDesignData.isHighLevelDesignSkipped ? '进入详细设计' : '进入高层设计'}
                        </Button>
                    </div>
                </TabPane>

                <TabPane tab="2. 高层设计" key={TAB_KEYS[1]} disabled={!canProceedFromEntry || currentDesignData.isHighLevelDesignSkipped}>
                    <Title level={4}>高层设计</Title>
                    <Alert message="高层设计为可选步骤，主要帮助梳理复杂系统的宏观结构。" type="info" showIcon style={{marginBottom: 16}}/>
                    {!currentDesignData.isHighLevelDesignSkipped && (
                        <>
                            <Steps current={currentHighLevelStep} onChange={setCurrentHighLevelStep} size="small" style={{ marginBottom: 24 }}>
                                {highLevelArtifactKeys.map(key => (
                                    <Steps.Step key={key} title={HIGH_LEVEL_DESIGN_ARTIFACTS[key]} />
                                ))}
                            </Steps>
                            
                            {renderArtifactCard('highLevel', highLevelArtifactKeys[currentHighLevelStep])}

                            <Space style={{ marginTop: 20, width: '100%', justifyContent: 'space-between' }}>
                                <Button 
                                    icon={<ArrowLeftOutlined />} 
                                    onClick={() => navigateInnerStep('highLevel', -1)}
                                    disabled={currentHighLevelStep === 0 || (isAIGenerating && isAIGenerating.type === 'highLevel')}
                                >
                                    上一步
                                </Button>
                                <Button icon={<DownloadOutlined/>} onClick={() => exportDesignDocument('highLevel')} disabled={(isAIGenerating && isAIGenerating.type === 'highLevel')}>导出高层设计文档</Button>
                                <Button 
                                    type="primary"
                                    icon={<ArrowRightOutlined />} 
                                    disabled={(isAIGenerating && isAIGenerating.type === 'highLevel')}
                                    onClick={() => {
                                        if (currentHighLevelStep < highLevelArtifactKeys.length - 1) {
                                            navigateInnerStep('highLevel', 1);
                                        } else {
                                            setActiveTab(TAB_KEYS[2]); // Move to Detailed Design
                                        }
                                    }}
                                >
                                    {currentHighLevelStep < highLevelArtifactKeys.length - 1 ? '下一步' : '完成高层设计，进入详细设计'}
                                </Button>
                            </Space>
                        </>
                    )}
                </TabPane>

                <TabPane tab="3. 详细设计" key={TAB_KEYS[2]} disabled={!canProceedFromEntry}>
                    <Title level={4}>详细设计</Title>
                    {currentDesignData.isHighLevelDesignSkipped && (
                         <Alert message="高层设计已跳过。" type="warning" showIcon style={{marginBottom: 16}}/>
                    )}
                    {!currentDesignData.isHighLevelDesignSkipped && currentDesignData.highLevelDesign && (
                        <Collapse ghost style={{ marginBottom: 16 }}>
                            <Panel header="已完成的高层设计概要 (点击展开/折叠)" key="hld-summary">
                                {highLevelArtifactKeys.map(key => (
                                    currentDesignData.highLevelDesign[key]?.content && (
                                    <div key={key} style={{marginBottom: 8}}>
                                        <Text strong>{HIGH_LEVEL_DESIGN_ARTIFACTS[key]}: </Text>
                                        <Text type="secondary">{(currentDesignData.highLevelDesign[key].content.substring(0, 100) + '...').replace(/\n/g, ' ')}</Text>
                                    </div>
                                    )
                                ))}
                                {!Object.values(currentDesignData.highLevelDesign).some(art => art.content) && <Text type="secondary">高层设计内容为空。</Text>}
                            </Panel>
                        </Collapse>
                    )}

                    <Steps current={currentDetailedStep} onChange={setCurrentDetailedStep} size="small" style={{ marginBottom: 24 }}>
                        {detailedArtifactKeys.map(key => (
                            <Steps.Step key={key} title={DETAILED_DESIGN_ARTIFACTS[key]} />
                        ))}
                    </Steps>

                    {renderArtifactCard('detailed', detailedArtifactKeys[currentDetailedStep])}
                    
                    <Space style={{ marginTop: 20, width: '100%', justifyContent: 'space-between' }}>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigateInnerStep('detailed', -1)}
                            disabled={currentDetailedStep === 0 || (isAIGenerating && isAIGenerating.type === 'detailed')}
                        >
                            上一步
                        </Button>
                        
                        <Space> {/* Group right buttons */}
                            <Button icon={<DownloadOutlined/>} onClick={() => exportDesignDocument('detailed')} disabled={(isAIGenerating && isAIGenerating.type === 'detailed')}>导出详细设计文档</Button>
                            <Button 
                                type="primary" 
                                onClick={handleConfirmStep} 
                                icon={<CheckOutlined />}
                                disabled={currentDetailedStep < detailedArtifactKeys.length - 1 || (isAIGenerating && isAIGenerating.type === 'detailed') || !currentDesignData.detailedDesign.designDocument?.content} 
                            >
                                完成并确认所有技术设计
                            </Button>
                        </Space>

                        <Button 
                            type="primary"
                            icon={<ArrowRightOutlined />} 
                            onClick={() => navigateInnerStep('detailed', 1)}
                            disabled={currentDetailedStep >= detailedArtifactKeys.length - 1 || (isAIGenerating && isAIGenerating.type === 'detailed')}
                        >
                            {currentDetailedStep === detailedArtifactKeys.length - 2 ? '生成设计文档' : '下一环节'}
                        </Button>
                    </Space>
                </TabPane>
            </Tabs>
        </Content>
    </Layout>
  );
}

export default Step3_Architect; 