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
      moduleBreakdown: { content: '', aiAdjustmentRequest: '' },
      appComponentBreakdown: { content: '', aiAdjustmentRequest: '' },
      appComponentCollaboration: { content: '', aiAdjustmentRequest: '' },
      deploymentDiagram: { content: '', aiAdjustmentRequest: '' }
    },
    detailedDesign: {
      fileList: { content: '', aiAdjustmentRequest: '' },
      keySequenceDiagram: { content: '', aiAdjustmentRequest: '' },
      stateDiagram: { content: '', aiAdjustmentRequest: '' },
      dbDesign: { content: '', aiAdjustmentRequest: '' },
      apiDocs: { content: '', aiAdjustmentRequest: '' },
      classDiagram: { content: '', aiAdjustmentRequest: '' },
      designDocument: { content: '', aiAdjustmentRequest: '' }
    },
    isConfirmed: false
  },
  codeSnippets: {
    frontend: `// React component example\nimport React, { useState, useEffect } from \'react\';\n\nfunction PetList() {\n  const [pets, setPets] = useState([]);\n\n  useEffect(() => {\n    // Fetch pets from API\n    // fetch(\'/api/pets\').then(res => res.json()).then(data => setPets(data));\n    setPets([{ id: 1, name: \'Buddy\', type: \'Dog\' }]); // Mock data\n  }, []);\n\n  return (\n    <div>\n      <h2>Available Pets</h2>\n      <ul>\n        {pets.map(pet => (\n          <li key={pet.id}>{pet.name} ({pet.type})</li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n\nexport default PetList;\n`,
    backend: `// Node.js/Express example route\nconst express = require(\'express\');\nconst router = express.Router();\n\n// Mock pet data\nconst pets = [{ id: 1, name: \'Buddy\', type: \'Dog\' }];\n\nrouter.get(\'/api/pets\', (req, res) => {\n  res.json(pets);\n});\n\nmodule.exports = router;\n`
  }
};
