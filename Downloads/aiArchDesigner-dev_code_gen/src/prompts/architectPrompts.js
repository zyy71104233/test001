/**
 * @file architectPrompts.js
 * @description Contains prompt templates for AI interactions in the Architect step.
 */

import { produce } from 'immer';

// Helper to safely get content, defaulting to an empty string if not found or empty
const getContent = (dataObject, key) => dataObject?.[key]?.content?.trim() || '';

// Mapping artifact keys to their human-readable names (already in Step3_Architect.js but useful here for prompts)
const HIGH_LEVEL_DESIGN_ARTIFACT_NAMES = {
  moduleBreakdown: '模块划分',
  appComponentBreakdown: '应用/组件划分',
  appComponentCollaboration: '应用/组件协作关系',
  deploymentDiagram: '部署图',
};

const DETAILED_DESIGN_ARTIFACT_NAMES = {
  keySequenceDiagram: '关键时序图',
  stateDiagram: '状态图',
  dbDesign: '库表设计',
  apiDocs: 'API文档',
  classDiagram: '类图',
};

/**
 * Generates a prompt for AI-assisted adjustment of an existing design artifact.
 * @param {string} artifactName - The user-friendly label of the artifact (e.g., '模块划分', '关键时序图').
 * @param {string} originalContent - The original Markdown content of the artifact.
 * @param {string} userInstruction - The user's natural language instruction for adjustment.
 * @returns {string} The fully constructed prompt for the LLM.
 */
export const getAIAdjustmentPrompt = (artifactName, originalContent, userInstruction) => {
  return `你是一位经验丰富的AI技术架构师。用户当前正在编辑技术设计文档中的 "${artifactName}" 部分。
原始"${artifactName}"内容如下:
---
${originalContent}
---
用户希望你根据以下指令调整上述内容:
"${userInstruction}"

请严格按照用户指令进行调整，并仅输出调整后的"${artifactName}"内容。确保内容专业、准确，并保持Markdown格式（如果适用）。`;
};

/**
 * Generates a prompt for initial AI generation of a design artifact, typically based on PRD and key design points.
 * @param {string} targetArtifactLabel - The user-friendly label of the artifact to be generated (e.g., '模块划分').
 * @param {string} targetArtifactType - The type of the artifact ('highLevel' or 'detailed').
 * @param {string} targetArtifactKey - The key of the artifact.
 * @param {string} prdContent - The content of the Product Requirements Document (PRD).
 * @param {string} designKeyPoints - Key design points provided by the user.
 * @param {object} currentHighLevelDesignData - The HLD object from state.
 * @param {object} currentDetailedDesignData - The DLD object from state.
 * @param {boolean} isHighLevelDesignSkipped - Indicates if the HLD was skipped.
 * @returns {string} The fully constructed prompt for the LLM.
 */
export const getInitialArtifactGenerationPrompt = (
  targetArtifactLabel,      // e.g., "模块划分"
  targetArtifactType,       // 'highLevel' or 'detailed'
  targetArtifactKey,        // e.g., "moduleBreakdown"
  prdContent,
  designKeyPoints,
  currentHighLevelDesignData, // The HLD object from state
  currentDetailedDesignData,   // The DLD object from state
  isHighLevelDesignSkipped
) => {
  let contextSections = [];

  // Common Context
  if (prdContent && prdContent.trim()) {
    contextSections.push(`# 1. 用户需求 (PRD):\n${prdContent.trim()}`);
  }
  if (designKeyPoints && designKeyPoints.trim()) {
    contextSections.push(`# 2. 设计要点:\n${designKeyPoints.trim()}`);
  }

  // --- High-Level Design Context ---
  if (!isHighLevelDesignSkipped && currentHighLevelDesignData) {
    const addHldContext = (key, label) => {
      const content = getContent(currentHighLevelDesignData, key);
      if (content) {
        contextSections.push(`# 已完成的高层设计 - ${label}:\n${content}`);
      }
    };

    if (targetArtifactType === 'highLevel') {
      if (targetArtifactKey === 'appComponentBreakdown') {
        addHldContext('moduleBreakdown', HIGH_LEVEL_DESIGN_ARTIFACT_NAMES.moduleBreakdown);
      }
      else if (targetArtifactKey === 'appComponentCollaboration') {
        addHldContext('moduleBreakdown', HIGH_LEVEL_DESIGN_ARTIFACT_NAMES.moduleBreakdown);
        addHldContext('appComponentBreakdown', HIGH_LEVEL_DESIGN_ARTIFACT_NAMES.appComponentBreakdown);
      }
      else if (targetArtifactKey === 'deploymentDiagram') {
        addHldContext('moduleBreakdown', HIGH_LEVEL_DESIGN_ARTIFACT_NAMES.moduleBreakdown);
        addHldContext('appComponentBreakdown', HIGH_LEVEL_DESIGN_ARTIFACT_NAMES.appComponentBreakdown);
        addHldContext('appComponentCollaboration', HIGH_LEVEL_DESIGN_ARTIFACT_NAMES.appComponentCollaboration);
      }
    }
    else if (targetArtifactType === 'detailed') {
      Object.keys(HIGH_LEVEL_DESIGN_ARTIFACT_NAMES).forEach(hldKey => {
        addHldContext(hldKey, HIGH_LEVEL_DESIGN_ARTIFACT_NAMES[hldKey]);
      });
    }
  }

  // --- Detailed Design Context ---
  if (targetArtifactType === 'detailed' && currentDetailedDesignData) {
    const addDldContext = (key, label) => {
      const content = getContent(currentDetailedDesignData, key);
      if (content) {
        contextSections.push(`# 已完成的详细设计 - ${label}:\n${content}`);
      }
    };

    if (targetArtifactKey === 'stateDiagram') {
      addDldContext('keySequenceDiagram', DETAILED_DESIGN_ARTIFACT_NAMES.keySequenceDiagram);
    }
    else if (targetArtifactKey === 'dbDesign') {
      addDldContext('keySequenceDiagram', DETAILED_DESIGN_ARTIFACT_NAMES.keySequenceDiagram);
      addDldContext('stateDiagram', DETAILED_DESIGN_ARTIFACT_NAMES.stateDiagram);
    }
    else if (targetArtifactKey === 'apiDocs') {
      addDldContext('keySequenceDiagram', DETAILED_DESIGN_ARTIFACT_NAMES.keySequenceDiagram);
      addDldContext('stateDiagram', DETAILED_DESIGN_ARTIFACT_NAMES.stateDiagram);
      addDldContext('dbDesign', DETAILED_DESIGN_ARTIFACT_NAMES.dbDesign);
    }
    else if (targetArtifactKey === 'classDiagram') {
      addDldContext('keySequenceDiagram', DETAILED_DESIGN_ARTIFACT_NAMES.keySequenceDiagram);
      addDldContext('stateDiagram', DETAILED_DESIGN_ARTIFACT_NAMES.stateDiagram);
      addDldContext('dbDesign', DETAILED_DESIGN_ARTIFACT_NAMES.dbDesign);
      addDldContext('apiDocs', DETAILED_DESIGN_ARTIFACT_NAMES.apiDocs);
    }
  }
  
  const contextString = contextSections.length > 0 
    ? contextSections.join('\n\n---\n\n') + '\n\n---\n\n'
    : '你将独立完成以下设计任务，无需参考其他上下文信息。\n\n';

  let extraRequirementsString = `# 额外要求:
- 需要输出API文档的时候,使用OpenAPI 3.0的格式进行输出，并请去掉不必要的内容。用户需要将直接复制你的内容到swagger editor进行渲染，请保证格式正确。`;

  if (targetArtifactKey === 'classDiagram') {
    const apiDocsContent = getContent(currentDetailedDesignData, 'apiDocs');
    if (apiDocsContent) { // Check if apiDocsContent is not null or empty
      extraRequirementsString += `
- **重要：** 生成的类图必须严格与先前提供的 "${DETAILED_DESIGN_ARTIFACT_NAMES.apiDocs}" 内容保持一致。请仔细检查API定义（例如路径、操作、参数、请求体、响应等），确保类图中的类、方法、属性、参数和返回类型与API文档完全匹配。`;
    } else {
      extraRequirementsString += `
- **注意：** 如果可能，请基于现有信息推断并设计类图。由于 "${DETAILED_DESIGN_ARTIFACT_NAMES.apiDocs}" 的上下文未提供或为空，无法进行严格对齐。`;
    }
  }

  return `你是一位经验丰富的AI技术架构师。
请根据以下提供的上下文信息，为技术设计文档中的 "${targetArtifactLabel}" 部分生成详细内容。

${contextString}

${extraRequirementsString}

# 你的任务:
请为 "${targetArtifactLabel}" 生成专业、详细且符合上述所有上下文要求的内容。
请确保输出为Markdown格式（如果适用）。仅输出"${targetArtifactLabel}"本身的内容，不要包含标题或者其他额外说明。`;
};