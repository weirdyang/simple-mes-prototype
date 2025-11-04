// TEMPLATE BUILDER IMPLEMENTATION
// Complete implementation for template creation and editing

// ============================================
// 1. TEMPLATE BUILDER UI MANAGER
// ============================================

const templateBuilderUI = {
  currentTemplate: null,
  currentStageIndex: null,
  
  /**
   * Show template builder modal
   * @param {object|null} template - Template to edit (null for new)
   */
  show(template = null) {
    this.currentTemplate = template || templateManager.createNew();
    this.render();
    document.getElementById('templateBuilderModal').classList.remove('hidden');
  },
  
  /**
   * Close template builder modal
   */
  close() {
    document.getElementById('templateBuilderModal').classList.add('hidden');
    this.currentTemplate = null;
    this.currentStageIndex = null;
  },
  
  /**
   * Render complete template builder UI
   */
  render() {
    // Set title
    const title = this.currentTemplate.templateId ? 'Edit Template' : 'Create Template';
    document.getElementById('templateBuilderTitle').textContent = title;
    
    // Fill basic info
    document.getElementById('templateName').value = this.currentTemplate.templateName || '';
    document.getElementById('templateDescription').value = this.currentTemplate.description || '';
    
    // Render parameters
    this.renderParameters();
    
    // Render variables
    this.renderVariables();
    
    // Render stages
    this.renderStages();
  },
  
  /**
   * Render parameters section
   */
  renderParameters() {
    const container = document.getElementById('parametersContainer');
    if (!container) return;
    
    const params = this.currentTemplate.parameters || [];
    
    let html = '<div class="builder-section">';
    html += '<h3>Parameters <span class="help-text">(Immutable configuration set at job creation)</span></h3>';
    html += '<div class="parameters-list">';
    
    params.forEach((param, index) => {
      html += `
        <div class="parameter-item" data-index="${index}">
          <div class="parameter-field">
            <label>ID:</label>
            <input type="text" value="${param.parameterId || ''}" 
                   onchange="templateBuilderUI.updateParameter(${index}, 'parameterId', this.value)"
                   placeholder="e.g., plateQuantity">
          </div>
          <div class="parameter-field">
            <label>Label:</label>
            <input type="text" value="${param.label || ''}"
                   onchange="templateBuilderUI.updateParameter(${index}, 'label', this.value)"
                   placeholder="e.g., Number of Plates">
          </div>
          <div class="parameter-field">
            <label>Default Value:</label>
            <input type="text" value="${param.defaultValue || ''}"
                   onchange="templateBuilderUI.updateParameter(${index}, 'defaultValue', this.value)"
                   placeholder="e.g., 10">
          </div>
          <div class="parameter-field">
            <label>Description:</label>
            <input type="text" value="${param.description || ''}"
                   onchange="templateBuilderUI.updateParameter(${index}, 'description', this.value)"
                   placeholder="Optional description">
          </div>
          <button class="btn-danger btn-sm" onclick="templateBuilderUI.removeParameter(${index})">Remove</button>
        </div>
      `;
    });
    
    html += '</div>';
    html += '<button class="btn-secondary" onclick="templateBuilderUI.addParameter()">+ Add Parameter</button>';
    html += '</div>';
    
    container.innerHTML = html;
  },
  
  /**
   * Render variables section
   */
  renderVariables() {
    const container = document.getElementById('variablesContainer');
    if (!container) return;
    
    const vars = this.currentTemplate.variables || [];
    
    let html = '<div class="builder-section">';
    html += '<h3>Variables <span class="help-text">(Mutable state updated during execution)</span></h3>';
    html += '<div class="variables-list">';
    
    vars.forEach((variable, index) => {
      html += `
        <div class="variable-item" data-index="${index}">
          <div class="variable-field">
            <label>ID:</label>
            <input type="text" value="${variable.variableId || ''}"
                   onchange="templateBuilderUI.updateVariable(${index}, 'variableId', this.value)"
                   placeholder="e.g., temperature">
          </div>
          <div class="variable-field">
            <label>Label:</label>
            <input type="text" value="${variable.label || ''}"
                   onchange="templateBuilderUI.updateVariable(${index}, 'label', this.value)"
                   placeholder="e.g., Temperature (°C)">
          </div>
          <div class="variable-field">
            <label>Default Value:</label>
            <input type="text" value="${variable.defaultValue || ''}"
                   onchange="templateBuilderUI.updateVariable(${index}, 'defaultValue', this.value)"
                   placeholder="e.g., 0">
          </div>
          <div class="variable-field">
            <label>Description:</label>
            <input type="text" value="${variable.description || ''}"
                   onchange="templateBuilderUI.updateVariable(${index}, 'description', this.value)"
                   placeholder="Optional description">
          </div>
          <button class="btn-danger btn-sm" onclick="templateBuilderUI.removeVariable(${index})">Remove</button>
        </div>
      `;
    });
    
    html += '</div>';
    html += '<button class="btn-secondary" onclick="templateBuilderUI.addVariable()">+ Add Variable</button>';
    html += '</div>';
    
    container.innerHTML = html;
  },
  
  /**
   * Render stages section
   */
  renderStages() {
    const container = document.getElementById('stagesContainer');
    if (!container) return;
    
    const stages = this.currentTemplate.stages || [];
    
    let html = '<div class="builder-section">';
    html += '<h3>Stages</h3>';
    html += '<div class="stages-list">';
    
    stages.forEach((stage, index) => {
      html += this.renderStage(stage, index);
    });
    
    html += '</div>';
    html += '<button class="btn-secondary" onclick="templateBuilderUI.addStage()">+ Add Stage</button>';
    html += '</div>';
    
    container.innerHTML = html;
  },
  
  /**
   * Render single stage
   */
  renderStage(stage, index) {
    let html = `
      <div class="stage-item" data-index="${index}">
        <div class="stage-header">
          <h4>Stage ${index + 1}</h4>
          <button class="btn-danger btn-sm" onclick="templateBuilderUI.removeStage(${index})">Remove Stage</button>
        </div>
        <div class="stage-fields">
          <div class="form-group">
            <label>Stage Name:</label>
            <input type="text" value="${stage.stageName || ''}"
                   onchange="templateBuilderUI.updateStage(${index}, 'stageName', this.value)"
                   placeholder="e.g., Preparation">
          </div>
          <div class="form-group">
            <label>Condition:</label>
            <select onchange="templateBuilderUI.updateStage(${index}, 'condition', this.value)">
              <option value="succeeded()" ${stage.condition === 'succeeded()' ? 'selected' : ''}>Run if previous succeeded</option>
              <option value="failed()" ${stage.condition === 'failed()' ? 'selected' : ''}>Run if previous failed</option>
              <option value="always()" ${stage.condition === 'always()' ? 'selected' : ''}>Always run</option>
            </select>
          </div>
        </div>
        
        <div class="steps-container">
          <h5>Steps</h5>
          <div class="steps-list">
    `;
    
    // Render steps
    (stage.steps || []).forEach((step, stepIndex) => {
      html += this.renderStep(step, index, stepIndex);
    });
    
    html += `
          </div>
          <button class="btn-secondary btn-sm" onclick="templateBuilderUI.addStep(${index})">+ Add Step</button>
        </div>
      </div>
    `;
    
    return html;
  },
  
  /**
   * Render single step
   */
  renderStep(step, stageIndex, stepIndex) {
    return `
      <div class="step-item" data-stage="${stageIndex}" data-step="${stepIndex}">
        <div class="step-header">
          <strong>Step ${stepIndex + 1}</strong>
          <button class="btn-danger btn-xs" onclick="templateBuilderUI.removeStep(${stageIndex}, ${stepIndex})">×</button>
        </div>
        <div class="step-fields">
          <input type="text" value="${step.stepName || ''}"
                 onchange="templateBuilderUI.updateStep(${stageIndex}, ${stepIndex}, 'stepName', this.value)"
                 placeholder="Step name (use \${paramName} for substitution)">
          <textarea onchange="templateBuilderUI.updateStep(${stageIndex}, ${stepIndex}, 'description', this.value)"
                    placeholder="Step description (optional)">${step.description || ''}</textarea>
          
          <div class="step-requirements">
            <label>Requirements:</label>
            ${(step.requirements || []).map((req, reqIndex) => `
              <div class="requirement-item">
                <input type="text" value="${req}" 
                       onchange="templateBuilderUI.updateStepRequirement(${stageIndex}, ${stepIndex}, ${reqIndex}, this.value)">
                <button class="btn-xs" onclick="templateBuilderUI.removeStepRequirement(${stageIndex}, ${stepIndex}, ${reqIndex})">×</button>
              </div>
            `).join('')}
            <button class="btn-xs" onclick="templateBuilderUI.addStepRequirement(${stageIndex}, ${stepIndex})">+ Requirement</button>
          </div>
          
          <div class="step-checklist">
            <label>Checklist Items:</label>
            ${(step.checklist || []).map((item, itemIndex) => `
              <div class="checklist-item">
                <input type="text" value="${item}" 
                       onchange="templateBuilderUI.updateStepChecklist(${stageIndex}, ${stepIndex}, ${itemIndex}, this.value)">
                <button class="btn-xs" onclick="templateBuilderUI.removeStepChecklist(${stageIndex}, ${stepIndex}, ${itemIndex})">×</button>
              </div>
            `).join('')}
            <button class="btn-xs" onclick="templateBuilderUI.addStepChecklist(${stageIndex}, ${stepIndex})">+ Checklist Item</button>
          </div>
        </div>
      </div>
    `;
  },
  
  // ============================================
  // PARAMETER MANAGEMENT
  // ============================================
  
  addParameter() {
    if (!this.currentTemplate.parameters) {
      this.currentTemplate.parameters = [];
    }
    this.currentTemplate.parameters.push({
      parameterId: '',
      label: '',
      defaultValue: '',
      description: ''
    });
    this.renderParameters();
  },
  
  updateParameter(index, field, value) {
    if (this.currentTemplate.parameters[index]) {
      this.currentTemplate.parameters[index][field] = value;
    }
  },
  
  removeParameter(index) {
    this.currentTemplate.parameters.splice(index, 1);
    this.renderParameters();
  },
  
  // ============================================
  // VARIABLE MANAGEMENT
  // ============================================
  
  addVariable() {
    if (!this.currentTemplate.variables) {
      this.currentTemplate.variables = [];
    }
    this.currentTemplate.variables.push({
      variableId: '',
      label: '',
      defaultValue: '',
      description: ''
    });
    this.renderVariables();
  },
  
  updateVariable(index, field, value) {
    if (this.currentTemplate.variables[index]) {
      this.currentTemplate.variables[index][field] = value;
    }
  },
  
  removeVariable(index) {
    this.currentTemplate.variables.splice(index, 1);
    this.renderVariables();
  },
  
  // ============================================
  // STAGE MANAGEMENT
  // ============================================
  
  addStage() {
    if (!this.currentTemplate.stages) {
      this.currentTemplate.stages = [];
    }
    this.currentTemplate.stages.push({
      stageId: utils.generateId('stage'),
      stageName: '',
      condition: 'succeeded()',
      steps: []
    });
    this.renderStages();
  },
  
  updateStage(index, field, value) {
    if (this.currentTemplate.stages[index]) {
      this.currentTemplate.stages[index][field] = value;
    }
  },
  
  removeStage(index) {
    if (confirm('Remove this stage and all its steps?')) {
      this.currentTemplate.stages.splice(index, 1);
      this.renderStages();
    }
  },
  
  // ============================================
  // STEP MANAGEMENT
  // ============================================
  
  addStep(stageIndex) {
    if (!this.currentTemplate.stages[stageIndex].steps) {
      this.currentTemplate.stages[stageIndex].steps = [];
    }
    this.currentTemplate.stages[stageIndex].steps.push({
      stepId: utils.generateId('step'),
      stepName: '',
      description: '',
      requirements: [],
      checklist: []
    });
    this.renderStages();
  },
  
  updateStep(stageIndex, stepIndex, field, value) {
    const step = this.currentTemplate.stages[stageIndex].steps[stepIndex];
    if (step) {
      step[field] = value;
    }
  },
  
  removeStep(stageIndex, stepIndex) {
    this.currentTemplate.stages[stageIndex].steps.splice(stepIndex, 1);
    this.renderStages();
  },
  
  // Step Requirements
  addStepRequirement(stageIndex, stepIndex) {
    const step = this.currentTemplate.stages[stageIndex].steps[stepIndex];
    if (!step.requirements) step.requirements = [];
    step.requirements.push('');
    this.renderStages();
  },
  
  updateStepRequirement(stageIndex, stepIndex, reqIndex, value) {
    const step = this.currentTemplate.stages[stageIndex].steps[stepIndex];
    if (step.requirements[reqIndex] !== undefined) {
      step.requirements[reqIndex] = value;
    }
  },
  
  removeStepRequirement(stageIndex, stepIndex, reqIndex) {
    const step = this.currentTemplate.stages[stageIndex].steps[stepIndex];
    step.requirements.splice(reqIndex, 1);
    this.renderStages();
  },
  
  // Step Checklist
  addStepChecklist(stageIndex, stepIndex) {
    const step = this.currentTemplate.stages[stageIndex].steps[stepIndex];
    if (!step.checklist) step.checklist = [];
    step.checklist.push('');
    this.renderStages();
  },
  
  updateStepChecklist(stageIndex, stepIndex, itemIndex, value) {
    const step = this.currentTemplate.stages[stageIndex].steps[stepIndex];
    if (step.checklist[itemIndex] !== undefined) {
      step.checklist[itemIndex] = value;
    }
  },
  
  removeStepChecklist(stageIndex, stepIndex, itemIndex) {
    const step = this.currentTemplate.stages[stageIndex].steps[stepIndex];
    step.checklist.splice(itemIndex, 1);
    this.renderStages();
  },
  
  // ============================================
  // SAVE TEMPLATE
  // ============================================
  
  save() {
    // Collect data from form
    this.currentTemplate.templateName = document.getElementById('templateName').value.trim();
    this.currentTemplate.description = document.getElementById('templateDescription').value.trim();
    
    // Validate
    if (!this.currentTemplate.templateName) {
      alert('Please enter a template name');
      return;
    }
    
    if (!this.currentTemplate.stages || this.currentTemplate.stages.length === 0) {
      alert('Please add at least one stage');
      return;
    }
    
    // Save
    const success = templateManager.save(this.currentTemplate);
    if (success) {
      alert('Template saved successfully!');
      this.close();
      // Refresh templates list
      uiManager.loadTemplates();
    } else {
      alert('Failed to save template. Please check console for errors.');
    }
  }
};