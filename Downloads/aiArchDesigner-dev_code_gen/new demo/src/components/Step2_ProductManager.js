import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Typography, Spin, Row, Col, message, Space, Divider, Tooltip } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, CheckCircleOutlined, FileDoneOutlined, DownloadOutlined, RobotOutlined } from '@ant-design/icons';
import { produce } from 'immer';
import { generateStreamContent } from '../services/llmService';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

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

function Step2_ProductManager({ userRequirement, prdData, setPrdData, onConfirmPrd }) {
  const [isEditingPrd, setIsEditingPrd] = useState(false);
  const [editablePrdContent, setEditablePrdContent] = useState('');
  const [adjustmentRequest, setAdjustmentRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAiOperation, setCurrentAiOperation] = useState(null); // 'generate' or 'adjust'

  useEffect(() => {
    // When prdData from App.js changes (e.g., initial load or reset), update local editable content if not editing
    if (prdData && prdData.content && !isEditingPrd) {
      setEditablePrdContent(prdData.content);
    }
    // If prdData content becomes empty (e.g. after reset from App.js), ensure editable is also empty
    if (prdData && !prdData.content && !isEditingPrd) {
      setEditablePrdContent('');
    }
  }, [prdData, isEditingPrd]);

  const handleStreamedContent = (isAdjustment = false) => {
    setIsLoading(true);
    setCurrentAiOperation(isAdjustment ? 'adjust' : 'generate');
    // Clear previous PRD content from editable state only if generating new, not adjusting
    if (!isAdjustment) {
      setEditablePrdContent('');
    }

    let localPrdAccumulator = isAdjustment ? editablePrdContent : ''; // Start with current content if adjusting

    const promptText = isAdjustment
      ? `请根据以下调整要求，修改这份Markdown格式的PRD文档。\n请在修改时尽量保持原文的结构和风格，并明确指出调整的部分。\n\n调整要求如下：\n\"${adjustmentRequest}\"\n\n以下是调整前的PRD内容（您可能需要基于此内容进行修改，而不是完全重写）：\n\`\`\`markdown\n${editablePrdContent}\n\`\`\`\n`
      : `请根据以下用户需求，以Markdown格式生成一份详细的产品需求文档 (PRD)。\nPRD应包含以下部分：\n1. 引言 (项目背景、目标用户、产品价值)\n2. 产品概述 (核心功能列表、产品特性)\n3. 功能详述 (每个核心功能的详细描述、用户故事、验收标准)\n4. 非功能性需求 (性能、安全、可用性等)\n5. 未来展望 (可能的迭代方向)。\n\n用户需求如下：\n\"${userRequirement}\"`;

    // Log the prompt to the console
    console.log(
      `[LLM Prompt - Step2_ProductManager - ${isAdjustment ? 'Adjust PRD' : 'Generate PRD'}]:`,
      promptText
    );

    generateStreamContent(
      promptText,
      (chunk) => {
        localPrdAccumulator += chunk;
        setEditablePrdContent(localPrdAccumulator);
      },
      (contentWasProcessed) => {
        setIsLoading(false);
        setCurrentAiOperation(null);
        if (!localPrdAccumulator && !contentWasProcessed) {
          message.info(isAdjustment ? 'AI 未对PRD进行调整。' : 'AI 未生成PRD内容。');
        } else {
          message.success(isAdjustment ? 'AI 已完成PRD调整!' : 'AI 已生成初步 PRD!');
          // Update App.js state with the new content from AI, but keep it unconfirmed
          setPrdData(produce(prdData, draft => {
            draft.content = localPrdAccumulator;
            draft.isConfirmed = false; // AI generation/adjustment unconfirms
          }));
        }
        if (isAdjustment) setAdjustmentRequest('');
      },
      (error) => {
        setIsLoading(false);
        setCurrentAiOperation(null);
        message.error(`AI 处理失败: ${error.message}`);
        console.error("Stream Error in Component:", error);
      }
    );
  };

  const generatePrd = () => {
    if (!userRequirement) {
      message.warning('请先返回上一步提交用户需求!');
      return;
    }
    setIsEditingPrd(false); // Exit editing mode if AI is generating new
    handleStreamedContent(false);
  };

  const submitAdjustment = () => {
    if (!adjustmentRequest.trim()) {
      message.warning('请输入调整要求!');
      return;
    }
    setIsEditingPrd(false); // Exit editing mode to show streaming output
    handleStreamedContent(true);
  };

  const handleEditPrd = () => {
    setEditablePrdContent(prdData.content || ''); // Ensure editable content is synced before editing
    setIsEditingPrd(true);
  };

  const handleSavePrdEdit = () => {
    setPrdData(produce(prdData, draft => {
      draft.content = editablePrdContent;
      draft.isConfirmed = false; // Manual edit unconfirms
    }));
    setIsEditingPrd(false);
    message.success('PRD修改已暂存，请确认。');
  };

  const handleCancelPrdEdit = () => {
    setEditablePrdContent(prdData.content || ''); // Revert to original from App.js state
    setIsEditingPrd(false);
  };

  const handleConfirmPrd = () => {
    if (!prdData.content && !editablePrdContent) {
      message.warning('PRD 内容为空，无法确认！');
      return;
    }
    if (isLoading) {
      message.warning('AI 仍在处理中，请稍后确认。');
      return;
    }
    setPrdData(produce(prdData, draft => {
      draft.isConfirmed = true;
      // Ensure the latest content (possibly from editablePrdContent if an edit was just made but not formally saved yet) is part of the confirmed data.
      // However, normal flow should be edit -> save (updates prdData.content) -> confirm.
      // If in editing mode, prompt to save first or confirm with current text area content.
      if (isEditingPrd) {
        draft.content = editablePrdContent;
        setIsEditingPrd(false);
      }
    }));
    message.success('PRD 已最终确认!');
    if (onConfirmPrd) onConfirmPrd(produce(prdData, draft => {
      draft.isConfirmed = true;
      if (isEditingPrd) draft.content = editablePrdContent;
    })); // Notify App.js
  };

  const handleDownload = () => {
    if (prdData && prdData.isConfirmed && prdData.content) {
      downloadFile(prdData.content, 'prd_document.md', 'text/markdown;charset=utf-8');
    } else {
      message.warning('请在最终确认 PRD 后下载！');
    }
  };

  const prdDisplayContent = isEditingPrd ? editablePrdContent : (prdData?.content || '');

  return (
    <div>
      <Title level={4}>需求分析 (PRD)</Title>
      <Card title="用户原始需求" style={{ marginBottom: 16 }} extra={
        <Button
          onClick={generatePrd}
          disabled={!userRequirement || isLoading || isEditingPrd}
          icon={<RobotOutlined />}
          type={prdData?.content ? "default" : "primary"}
        >
          {prdData?.content ? 'AI 重新生成 PRD' : 'AI 生成 PRD'}
        </Button>
      }>
        <Paragraph>{userRequirement || '请先在上一步提交需求'}</Paragraph>
      </Card>

      {isLoading && (
        <Spin tip={`AI 正在${currentAiOperation === 'generate' ? '生成 PRD' : '调整 PRD'}...`}>
          <Card style={{ marginTop: 16, minHeight: 200 }} bodyStyle={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {editablePrdContent || 'AI正在努力输出中，请稍候...'}
          </Card>
        </Spin>
      )}

      {!isLoading && (prdData?.content || editablePrdContent || isEditingPrd) && (
        <Card
          title={prdData?.isConfirmed ? "PRD 内容 (已确认)" : "PRD 内容 (待确认)"}
          style={{ marginTop: 16 }}
          extra={
            <Space>
              {!isEditingPrd && prdData?.content && !prdData.isConfirmed && (
                <Tooltip title="编辑PRD内容">
                  <Button icon={<EditOutlined />} onClick={handleEditPrd} disabled={isLoading} />
                </Tooltip>
              )}
              {isEditingPrd && (
                <>
                  <Tooltip title="保存修改">
                    <Button icon={<SaveOutlined />} type="primary" onClick={handleSavePrdEdit} disabled={isLoading} />
                  </Tooltip>
                  <Tooltip title="取消编辑">
                    <Button icon={<CloseOutlined />} onClick={handleCancelPrdEdit} disabled={isLoading} />
                  </Tooltip>
                </>
              )}
            </Space>
          }
        >
          {isEditingPrd ? (
            <TextArea
              rows={15}
              value={editablePrdContent}
              onChange={(e) => setEditablePrdContent(e.target.value)}
              disabled={isLoading}
            />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: '400px', overflowY: 'auto' }}>
              {prdDisplayContent || 'PRD内容为空，请使用AI生成。'}
            </pre>
          )}
        </Card>
      )}

      {!isLoading && !isEditingPrd && prdData?.content && (
        <Card title="PRD 调整与确认" style={{ marginTop: 16 }}>
          <Paragraph>如果需要，请输入调整要求，或直接确认当前PRD版本。</Paragraph>
          <TextArea
            rows={3}
            value={adjustmentRequest}
            onChange={(e) => setAdjustmentRequest(e.target.value)}
            placeholder="例如：增加用户评论功能，修改购物车逻辑..."
            disabled={isLoading || prdData.isConfirmed}
            style={{ marginBottom: 8 }}
          />
          <Space>
            <Button
              onClick={submitAdjustment}
              disabled={!adjustmentRequest.trim() || isLoading || prdData.isConfirmed}
              icon={<RobotOutlined />}
            >
              提交给AI调整
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmPrd}
              disabled={isLoading || prdData.isConfirmed || !prdData.content}
              icon={<CheckCircleOutlined />}
            >
              {prdData.isConfirmed ? 'PRD已确认' : '确认此版PRD'}
            </Button>
          </Space>
        </Card>
      )}

      {prdData?.isConfirmed && !isLoading && (
        <Space style={{ marginTop: 16 }}>
          <Paragraph strong style={{ color: 'green' }}><FileDoneOutlined /> PRD 已确认。</Paragraph>
          <Button onClick={handleDownload} icon={<DownloadOutlined />}>
            下载 PRD
          </Button>
        </Space>
      )}
    </div>
  );
}

export default Step2_ProductManager;