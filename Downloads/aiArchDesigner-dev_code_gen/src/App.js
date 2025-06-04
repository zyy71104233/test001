import React, { useState } from 'react';
import { Steps, Button, message, Layout, Typography, Row, Col } from 'antd';
import Step1_UserRequirement from './components/Step1_UserRequirement';
import Step2_ProductManager from './components/Step2_ProductManager';
import Step3_Architect from './components/Step3_Architect';
import Step4_Developer from './components/Step4_Developer';
import Step5_Testing from './components/Step5_Testing';
import { mockData } from './data/mockData';
import './index.css'; // Ensure styles are imported

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const steps = [
  {
    title: '用户需求',
    content: 'Step1_UserRequirement',
  },
  {
    title: '需求分析',
    content: 'Step2_ProductManager',
  },
  {
    title: '技术设计',
    content: 'Step3_Architect',
  },
  {
    title: '开发实现',
    content: 'Step4_Developer',
  },
  {
    title: '测试验证',
    content: 'Step5_Testing',
  },
];

// Define the initial structure for the new architect design data
const initialArchitectDesignData = {
  uploadedRequirementsFile: null, // Or some initial placeholder
  designKeyPoints: '',
  isHighLevelDesignSkipped: false,
  highLevelDesign: {
    moduleBreakdown: { content: '', aiAdjustmentRequest: '' },
    appComponentBreakdown: { content: '', aiAdjustmentRequest: '' },
    appComponentCollaboration: { content: '', aiAdjustmentRequest: '' },
    deploymentDiagram: { content: '', aiAdjustmentRequest: '' },
  },
  detailedDesign: {
    keySequenceDiagram: { content: '', aiAdjustmentRequest: '' },
    stateDiagram: { content: '', aiAdjustmentRequest: '' },
    dbDesign: { content: '', aiAdjustmentRequest: '' },
    apiDocs: { content: '', aiAdjustmentRequest: '' },
    classDiagram: { content: '', aiAdjustmentRequest: '' },
  },
  isConfirmed: false, // To track if the overall step 3 is confirmed
};


function App() {
  const [current, setCurrent] = useState(0);
  const [userRequirement, setUserRequirement] = useState('');
  // Initialize prd state as an object with content and isConfirmed
  const [prdData, setPrdData] = useState(JSON.parse(JSON.stringify(mockData.prd))); 
  // Replace architectOutput with the new detailed structure
  const [architectDesign, setArchitectDesign] = useState(JSON.parse(JSON.stringify(initialArchitectDesignData)));
  const [developerCode, setDeveloperCode] = useState(null);
  // maxReachedStep is no longer strictly enforced for navigation but can be kept for UI indication if desired
  // For now, let's simplify its role or remove strict enforcement.
  // const [maxReachedStep, setMaxReachedStep] = useState(0);

  const updateCurrentStep = (step) => {
    // if (step > maxReachedStep) {
    //    setMaxReachedStep(step);
    // }
    setCurrent(step);
  }

  const next = () => {
    // Validation for PRD confirmation before moving to Step 3 (Architect)
    if (current === 1 && !prdData.isConfirmed) {
        message.warning('请先确认PRD，再进入技术设计阶段。');
        return;
    }
    // Other validations (if any) can be added here following the same pattern
    // e.g., if (current === 0 && !userRequirement) { ... }
    // e.g., if (current === 2 && !architectDesign.isConfirmed) { ... }

    if (current < steps.length - 1) { 
      updateCurrentStep(current + 1);
    }
  };

  const prev = () => {
    if (current > 0) {
        updateCurrentStep(current - 1);
    }
  };

  const handleStepChange = (step) => {
    // Validation for PRD confirmation when trying to navigate to Step 3 (Architect) directly
    if (current === 1 && step === 2 && !prdData.isConfirmed) {
      message.warning('请先确认PRD，再进入技术设计阶段。');
      return; // Prevent navigation
    }
    // Allow navigating freely to other steps if condition not met
    updateCurrentStep(step);
  };

  const handleUserSubmit = (requirement) => {
    setUserRequirement(requirement);
    message.success('用户需求已提交!');
    // Reset PRD when new user requirement is submitted
    setPrdData(JSON.parse(JSON.stringify(mockData.prd))); 
    // if (maxReachedStep < 1) setMaxReachedStep(1);
  };

  // Updated to handle the prdData object
  const handlePrdConfirm = (confirmedPrdData) => {
    setPrdData(confirmedPrdData);
    // if (maxReachedStep < 2) setMaxReachedStep(2);
  };

   const handleArchitectConfirm = (confirmedDesignData) => {
    setArchitectDesign({...confirmedDesignData, isConfirmed: true }); // Mark as confirmed
    message.success('技术设计已确认!');
    // if (maxReachedStep < 3) setMaxReachedStep(3);
  };

   // Add handler for developer step completion
   const handleDeveloperConfirm = (generatedCode) => {
       setDeveloperCode(generatedCode);
       message.success('开发实现代码已生成!');
       // if (maxReachedStep < 4) setMaxReachedStep(4); 
   }

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return <Step1_UserRequirement onSubmit={handleUserSubmit} initialValue={mockData.userRequirement} />;
      case 1:
        // Pass prdData and setPrdData to Step2_ProductManager
        return <Step2_ProductManager 
                  userRequirement={userRequirement} 
                  prdData={prdData} 
                  setPrdData={setPrdData} // Pass the setter function
                  onConfirmPrd={handlePrdConfirm} // Keep for explicit confirmation if needed, or setPrdData can handle it
                />;
      case 2:
        // Pass the new architectDesign state and its setter (or the confirm handler)
        // Also pass the relevant mock data which will need to be restructured.
        return <Step3_Architect 
                    prd={prdData.content} // Pass only the content for architect step
                    onConfirm={handleArchitectConfirm} 
                    initialDesignData={mockData.architectDesignData || initialArchitectDesignData} // Ensure mockData provides this
                    currentDesignData={architectDesign}
                    setDesignData={setArchitectDesign} // Allow Step3 to directly update its state in App.js
                />;
      case 3:
        return <Step4_Developer architectOutput={architectDesign} /* Pass the whole design if needed */ onConfirm={handleDeveloperConfirm} codeSnippets={mockData.codeSnippets}/>;
      case 4:
        return <Step5_Testing developerCode={developerCode} />;
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: '#1890ff', margin: 0 }}>AI 低代码平台 POC</Title>
      </Header>
      <Layout>
          <Sider width={200} theme="light" style={{ borderRight: '1px solid #f0f0f0'}}>
               <Steps 
                  current={current} 
                  items={items} 
                  onChange={handleStepChange} 
                  direction="vertical"
                  style={{ padding: '24px' }}
                />
          </Sider>
          <Layout style={{ padding: '24px' }}>
              <Content
                    style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                    background: '#fff',
                    }}
                >
                 {renderStepContent()}
              </Content>
              <div className="step-actions" style={{ background: '#fff', padding: '10px 24px', textAlign: 'right', borderTop: '1px solid #f0f0f0'}}>
                 {current > 0 && (
                  <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                    上一步
                  </Button>
                )}
                {current < steps.length - 1 && (
                  <Button type="primary" onClick={() => next()} /* disabled removed */ > 
                    下一步
                  </Button>
                )}
                {current === steps.length - 1 && (
                  <Button type="primary" onClick={() => message.success('流程完成!')}>
                    完成
                  </Button>
                )}
             </div>
          </Layout>
      </Layout>
    </Layout>
  );
}

export default App; 