import React, { useState } from 'react';
import { Input, Button, Typography } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

function Step1_UserRequirement({ onSubmit, initialValue }) {
  const [requirement, setRequirement] = useState(initialValue || '');

  const handleSubmit = () => {
    onSubmit(requirement);
  };

  return (
    <div>
      <Title level={4}>请输入您的需求</Title>
      <TextArea
        rows={6}
        value={requirement}
        onChange={(e) => setRequirement(e.target.value)}
        placeholder="例如：我需要一个在线宠物商店，用户可以浏览不同种类的宠物，查看详情，并进行购买。"
      />
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <Button type="primary" onClick={handleSubmit}>
          提交需求
        </Button>
      </div>
    </div>
  );
}

export default Step1_UserRequirement; 