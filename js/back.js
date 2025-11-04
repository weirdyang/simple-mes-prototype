// Job Management System - Main Application
// This is the orchestrator that ties all modules together

const app = {
  /**
   * Initialize application
   */
  init() {
    // Initialize all managers
    configManager.init();
    dataManager.init();
    authManager.init();
    
    // Check authentication
    if (authManager.checkAuth()) {
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  /**
   * Show login screen
   */
  showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
  },

  /**
   * Show main app
   */
  showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    
    // Initialize UI
    uiManager.init();
    uiManager.switchView('dashboard');
    
    // Update user info
    const user = authManager.getCurrentUser();
    if (user) {
      document.getElementById('currentUserName').textContent = user.fullName;
      document.getElementById('currentUserRole').textContent = user.role;
    }
  },

  /**
   * Login
   */
  login() {
    const username = document.getElementById('loginUsername').value;
    const role = document.getElementById('loginRole').value;

    if (!username) {
      alert('Please enter username');
      return;
    }

    if (authManager.login(username, role)) {
      this.showApp();
    } else {
      alert('Login failed');
    }
  },

  /**
   * Logout
   */
  logout() {
    authManager.logout();
    this.showLogin();
  },

  // ==================== TEMPLATE MANAGEMENT ====================
  showTemplateBuilder() {
    this.editingTemplate = {
      templateId: 'template_' + Date.now(),
      templateName: '',
      description: '',
      stages: [],
      createdAt: Date.now(),
      createdBy: authManager.currentUser.userId
    };

    document.getElementById('templateBuilderTitle').textContent = 'Create Template';
    document.getElementById('templateName').value = '';
    document.getElementById('templateDescription').value = '';
    document.getElementById('stagesList').innerHTML = '';

    document.getElementById('templateBuilderModal').classList.remove('hidden');
  },

  editTemplate(templateId) {
    const template = this.data.templates.find(t => t.templateId === templateId);
    if (!template) return;

    this.editingTemplate = JSON.parse(JSON.stringify(template)); // Deep clone

    document.getElementById('templateBuilderTitle').textContent = 'Edit Template';
    document.getElementById('templateName').value = template.templateName;
    document.getElementById('templateDescription').value = template.description || '';

    this.renderStages();
    document.getElementById('templateBuilderModal').classList.remove('hidden');
  },

  closeTemplateBuilder() {
    this.editingTemplate = null;
    document.getElementById('templateBuilderModal').classList.add('hidden');
  },

  addStage() {
    const stages = this.editingTemplate.stages;
    
    // Auto-generate dependency on previous stage
    let dependencies = [];
    if (stages.length > 0) {
      dependencies = [stages[stages.length - 1].stageId];
    }
    
    const stage = {
      stageId: 'stage_' + Date.now(),
      stageName: 'New Stage',
      order: stages.length + 1,
      dependencies: dependencies,
      steps: []
    };
    stages.push(stage);
    this.renderStages();
  },

  removeStage(index) {
    this.editingTemplate.stages.splice(index, 1);
    // Reorder
    this.editingTemplate.stages.forEach((stage, i) => {
      stage.order = i + 1;
    });
    this.renderStages();
  },

  addStep(stageIndex) {
    const stage = this.editingTemplate.stages[stageIndex];
    const steps = stage.steps;
    
    // Auto-generate dependency on previous step in SAME stage only
    let dependencies = [];
    if (steps.length > 0) {
      // Depend on the last step in this stage
      dependencies = [steps[steps.length - 1].stepId];
    }
    // First step of stage has no step dependencies (stage dependency handles cross-stage)
    
    const step = {
      stepId: 'step_' + Date.now(),
      stepName: 'New Step',
      description: '',
      order: steps.length + 1,
      dependencies: dependencies,
      requirements: [],
      checklist: []
    };
    steps.push(step);
    this.renderStages();
  },

  removeStep(stageIndex, stepIndex) {
    this.editingTemplate.stages[stageIndex].steps.splice(stepIndex, 1);
    // Reorder
    this.editingTemplate.stages[stageIndex].steps.forEach((step, i) => {
      step.order = i + 1;
    });
    this.renderStages();
  },

  addRequirement(stageIndex, stepIndex) {
    this.editingTemplate.stages[stageIndex].steps[stepIndex].requirements.push('');
    this.renderStages();
  },

  removeRequirement(stageIndex, stepIndex, reqIndex) {
    this.editingTemplate.stages[stageIndex].steps[stepIndex].requirements.splice(reqIndex, 1);
    this.renderStages();
  },

  addChecklistItem(stageIndex, stepIndex) {
    this.editingTemplate.stages[stageIndex].steps[stepIndex].checklist.push('');
    this.renderStages();
  },

  removeChecklistItem(stageIndex, stepIndex, itemIndex) {
    this.editingTemplate.stages[stageIndex].steps[stepIndex].checklist.splice(itemIndex, 1);
    this.renderStages();
  },

  renderStages() {
    const stagesList = document.getElementById('stagesList');

    if (this.editingTemplate.stages.length === 0) {
      stagesList.innerHTML = '<p style="color: #6b7280;">No stages added yet</p>';
      return;
    }

    stagesList.innerHTML = this.editingTemplate.stages.map((stage, stageIndex) => `
      <div class="stage-card">
        <div class="stage-header">
          <input type="text" value="${stage.stageName}" 
                 onchange="app.editingTemplate.stages[${stageIndex}].stageName = this.value">
          <div class="stage-actions">
            <button class="btn-danger" onclick="app.removeStage(${stageIndex})">Remove Stage</button>
          </div>
        </div>
        
        <div class="steps-list">
          ${stage.steps.map((step, stepIndex) => `
            <div class="step-card">
              <div class="step-header">
                <div class="step-fields">
                  <input type="text" placeholder="Step name" value="${step.stepName}"
                         onchange="app.editingTemplate.stages[${stageIndex}].steps[${stepIndex}].stepName = this.value">
                  <textarea placeholder="Step description" 
                            onchange="app.editingTemplate.stages[${stageIndex}].steps[${stepIndex}].description = this.value">${step.description}</textarea>
                </div>
                <div class="step-actions">
                  <button class="btn-danger" onclick="app.removeStep(${stageIndex}, ${stepIndex})">Remove</button>
                </div>
              </div>
              
              <div class="requirements-list">
                <strong>Requirements:</strong>
                ${step.requirements.map((req, reqIndex) => `
                  <div class="requirement-item">
                    <input type="text" value="${req}" 
                           onchange="app.editingTemplate.stages[${stageIndex}].steps[${stepIndex}].requirements[${reqIndex}] = this.value">
                    <button class="remove-btn" onclick="app.removeRequirement(${stageIndex}, ${stepIndex}, ${reqIndex})">X</button>
                  </div>
                `).join('')}
                <button class="btn-secondary" style="margin-top: 5px; padding: 6px 12px; font-size: 12px;" 
                        onclick="app.addRequirement(${stageIndex}, ${stepIndex})">+ Add Requirement</button>
              </div>
              
              <div class="checklist-list">
                <strong>Checklist:</strong>
                ${step.checklist.map((item, itemIndex) => `
                  <div class="checklist-item">
                    <input type="text" value="${item}" 
                           onchange="app.editingTemplate.stages[${stageIndex}].steps[${stepIndex}].checklist[${itemIndex}] = this.value">
                    <button class="remove-btn" onclick="app.removeChecklistItem(${stageIndex}, ${stepIndex}, ${itemIndex})">X</button>
                  </div>
                `).join('')}
                <button class="btn-secondary" style="margin-top: 5px; padding: 6px 12px; font-size: 12px;" 
                        onclick="app.addChecklistItem(${stageIndex}, ${stepIndex})">+ Add Checklist Item</button>
              </div>
            </div>
          `).join('')}
        </div>
        
        <button class="btn-secondary" style="margin-top: 10px;" 
                onclick="app.addStep(${stageIndex})">+ Add Step</button>
      </div>
    `).join('');
  },

  saveTemplate() {
    const name = document.getElementById('templateName').value.trim();
    const description = document.getElementById('templateDescription').value.trim();

    if (!name) {
      alert('Please enter a template name');
      return;
    }

    if (this.editingTemplate.stages.length === 0) {
      alert('Please add at least one stage');
      return;
    }

    this.editingTemplate.templateName = name;
    this.editingTemplate.description = description;

    // Check if editing existing or creating new
    const existingIndex = this.data.templates.findIndex(t => t.templateId === this.editingTemplate.templateId);
    if (existingIndex >= 0) {
      this.data.templates[existingIndex] = this.editingTemplate;
    } else {
      this.data.templates.push(this.editingTemplate);
    }

    this.saveData();
    this.closeTemplateBuilder();
    this.loadTemplates();
  },
  /**
   * Import template from JSON
   */
  async importTemplateFromJSON() {
    try {
      const template = await templateManager.importFromJSON();
      alert(`Template "${template.templateName}" imported successfully!`);
      uiManager.loadTemplates();
    } catch (error) {
      alert('Import failed: ' + error);
    }
  },

  /**
   * Delete template
   * @param {string} templateId - Template ID
   */
  deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    if (templateManager.delete(templateId)) {
      uiManager.loadTemplates();
      alert('Template deleted');
    } else {
      alert('Failed to delete template');
    }
  },

  // ==================== JOB MANAGEMENT ====================

  /**
   * Show job creator modal
   */
  showJobCreator() {
    // Populate template dropdown
    const templateSelect = document.getElementById('jobTemplate');
    const templates = templateManager.getAll();
    templateSelect.innerHTML = '<option value="">-- Select Template --</option>' +
      templates.map(t => `<option value="${t.templateId}">${t.templateName}</option>`).join('');

    // Populate users dropdown
    const userSelect = document.getElementById('jobAssignedTo');
    const users = dataManager.getUsers().filter(u => u.active);
    userSelect.innerHTML = '<option value="">-- Unassigned --</option>' +
      users.map(u => `<option value="${u.userId}">${u.fullName}</option>`).join('');

    // Clear form
    document.getElementById('jobName').value = '';
    document.getElementById('jobOrderNo').value = '';
    document.getElementById('jobClient').value = '';
    document.getElementById('jobDueDate').value = '';
    document.getElementById('jobParametersSection').innerHTML = '';

    uiManager.showModal('jobCreatorModal');
  },

  /**
   * Close job creator modal
   */
  closeJobCreator() {
    uiManager.hideModal('jobCreatorModal');
  },

  /**
   * Handle template selection in job creator
   */
  onTemplateSelected() {
    const templateId = document.getElementById('jobTemplate').value;
    const container = document.getElementById('jobParametersSection');
    
    if (!templateId) {
      container.innerHTML = '';
      return;
    }
    
    const template = templateManager.getById(templateId);
    if (!template || !template.parameters || template.parameters.length === 0) {
      container.innerHTML = '';
      return;
    }
    
    // Generate parameter input fields
    container.innerHTML = '<h3>Job Parameters</h3>' +
      template.parameters.map(param => {
        const value = param.defaultValue !== undefined ? param.defaultValue : '';
        return `
          <div class="form-group">
            <label>${param.label}</label>
            <input type="text" 
                   id="param_${param.parameterId}" 
                   value="${value}"
                   placeholder="${param.description || ''}"
                   class="form-control">
            ${param.description ? `<small style="color: #6b7280;">${param.description}</small>` : ''}
          </div>
        `;
      }).join('');
  },

  /**
   * Create job
   */
  createJob() {
    const templateId = document.getElementById('jobTemplate').value;
    const jobName = document.getElementById('jobName').value.trim();
    const orderNo = document.getElementById('jobOrderNo').value.trim();
    const client = document.getElementById('jobClient').value.trim();
    const dueDate = document.getElementById('jobDueDate').value;
    const assignedTo = document.getElementById('jobAssignedTo').value;

    if (!templateId) {
      alert('Please select a template');
      return;
    }

    if (!jobName || !orderNo) {
      alert('Please enter job name and order number');
      return;
    }

    const template = templateManager.getById(templateId);
    if (!template) {
      alert('Template not found');
      return;
    }

    // Collect parameter values
    const parameters = {};
    if (template.parameters && template.parameters.length > 0) {
      template.parameters.forEach(param => {
        const input = document.getElementById(`param_${param.parameterId}`);
        if (input) {
          parameters[param.parameterId] = input.value || param.defaultValue;
        } else {
          parameters[param.parameterId] = param.defaultValue;
        }
      });
    }

    // Create job
    const job = jobManager.createFromTemplate({
      templateId,
      jobName,
      orderNo,
      client,
      dueDate,
      assignedTo,
      parameters
    });

    if (job) {
      this.closeJobCreator();
      uiManager.loadJobs();
      alert('Job created successfully!');
    } else {
      alert('Failed to create job');
    }
  },

  /**
   * Open job detail modal
   * @param {string} jobId - Job ID
   */
  openJobDetail(jobId) {
    const job = jobManager.getById(jobId);
    if (!job) return;

    jobManager.editingJob = job;

    // Set basic info
    document.getElementById('jobDetailTitle').textContent = job.jobName;
    document.getElementById('jobDetailOrderNo').textContent = job.orderNo;
    document.getElementById('jobDetailClient').textContent = job.client || 'N/A';
    document.getElementById('jobDetailDueDate').textContent = job.dueDate || 'Not set';
    document.getElementById('jobDetailStatus').textContent = job.status;
    document.getElementById('jobDetailStatus').className = 'badge badge-' + job.status;

    const assignedUser = dataManager.getUserById(job.assignedTo);
    document.getElementById('jobDetailAssignedTo').textContent = assignedUser ? assignedUser.fullName : 'Unassigned';

    // Display parameters and variables
    const template = templateManager.getById(job.templateId);
    let paramsHtml = '';
    
    if (job.parameters && Object.keys(job.parameters).length > 0) {
      paramsHtml += '<div style="margin: 15px 0;"><h3>Parameters</h3><div style="background: #f9fafb; padding: 10px; border-radius: 4px;">';
      Object.keys(job.parameters).forEach(key => {
        const param = template?.parameters?.find(p => p.parameterId === key);
        const label = param?.label || key;
        paramsHtml += `<div style="margin: 5px 0;"><strong>${label}:</strong> ${job.parameters[key]}</div>`;
      });
      paramsHtml += '</div></div>';
    }
    
    if (job.variables && Object.keys(job.variables).length > 0) {
      paramsHtml += '<div style="margin: 15px 0;"><h3>Variables</h3><div style="background: #f0fdf4; padding: 10px; border-radius: 4px;">';
      Object.keys(job.variables).forEach(key => {
        const variable = template?.variables?.find(v => v.variableId === key);
        const label = variable?.label || key;
        paramsHtml += `<div style="margin: 5px 0;"><strong>${label}:</strong> ${job.variables[key]}</div>`;
      });
      paramsHtml += '</div></div>';
    }
    
    document.getElementById('jobParametersDisplay').innerHTML = paramsHtml;

    // Render stages and steps
    this.renderJobStages(job);

    uiManager.showModal('jobDetailModal');
  },

  /**
   * Render job stages
   * @param {object} job - Job object
   */
  renderJobStages(job) {
    const container = document.getElementById('jobStagesList');
    
    container.innerHTML = job.stageExecutions.map((stage, stageIndex) => {
      const completedSteps = stage.stepExecutions.filter(s => s.status === 'completed').length;
      const totalSteps = stage.stepExecutions.length;
      
      return `
        <div class="job-stage">
          <div class="job-stage-header">
            <span>${stage.stageName}</span>
            <span class="badge badge-${stage.status}">${completedSteps}/${totalSteps} completed</span>
          </div>
          <div class="job-steps">
            ${stage.stepExecutions.map((step, stepIndex) => `
              <div class="job-step">
                <div>
                  <div class="step-name">${step.stepName}</div>
                  <div class="step-meta">${step.description}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="badge badge-${step.status}">${step.status}</span>
                  <button class="btn-primary" onclick="app.openStepExecution(${stageIndex}, ${stepIndex})">
                    ${jobManager.canStartStep(job, stageIndex, stepIndex) && step.status === 'pending' ? 'Start' : 'View'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Close job detail modal
   */
  closeJobDetail() {
    jobManager.editingJob = null;
    uiManager.hideModal('jobDetailModal');
  },

  /**
   * Open step execution modal
   * @param {number} stageIndex - Stage index
   * @param {number} stepIndex - Step index
   */
  openStepExecution(stageIndex, stepIndex) {
    const job = jobManager.editingJob;
    const step = job.stageExecutions[stageIndex].stepExecutions[stepIndex];
    const canStart = jobManager.canStartStep(job, stageIndex, stepIndex);
    
    jobManager.editingStep = { stageIndex, stepIndex, step, canStart };

    document.getElementById('stepExecutionTitle').textContent = step.stepName;
    document.getElementById('stepDescription').textContent = step.description || 'No description';
    document.getElementById('stepCurrentStatus').textContent = step.status;
    document.getElementById('stepCurrentStatus').className = 'badge badge-' + step.status;

    // Requirements
    const requirementsDiv = document.getElementById('stepRequirements');
    if (step.requirements && step.requirements.length > 0) {
      requirementsDiv.innerHTML = '<h3>Requirements</h3><ul>' +
        step.requirements.map(req => `<li>${typeof req === 'string' ? req : JSON.stringify(req)}</li>`).join('') +
        '</ul>';
    } else {
      requirementsDiv.innerHTML = '';
    }

    // Checklist
    const checklistDiv = document.getElementById('stepChecklistItems');
    checklistDiv.innerHTML = step.checklist.map((item, i) => `
      <div class="checklist-execution-item">
        <input type="checkbox" id="check_${i}" ${item.checked ? 'checked' : ''} 
               ${step.status !== 'in-progress' ? 'disabled' : ''}>
        <label for="check_${i}">${item.item}</label>
      </div>
    `).join('');

    // Notes
    document.getElementById('stepNotes').value = step.notes || '';
    document.getElementById('stepNotes').disabled = step.status === 'completed';

    // Variables section
    const template = templateManager.getById(job.templateId);
    let variablesHtml = '';
    
    if (template && template.variables && template.variables.length > 0 && step.status === 'in-progress') {
      variablesHtml = '<h3>Update Variables</h3>';
      template.variables.forEach(variable => {
        const currentValue = job.variables[variable.variableId];
        variablesHtml += `
          <div class="form-group">
            <label>${variable.label}</label>
            <input type="text" 
                   id="var_${variable.variableId}" 
                   value="${currentValue !== undefined && currentValue !== null ? currentValue : ''}"
                   placeholder="${variable.description || ''}"
                   class="form-control">
            ${variable.description ? `<small style="color: #6b7280;">${variable.description}</small>` : ''}
          </div>
        `;
      });
    }
    
    document.getElementById('stepVariablesSection').innerHTML = variablesHtml;

    // Buttons
    const btnStart = document.getElementById('btnStartStep');
    const btnComplete = document.getElementById('btnCompleteStep');

    if (step.status === 'pending' && canStart) {
      btnStart.style.display = 'inline-block';
      btnComplete.style.display = 'none';
    } else if (step.status === 'in-progress') {
      btnStart.style.display = 'none';
      btnComplete.style.display = 'inline-block';
    } else {
      btnStart.style.display = 'none';
      btnComplete.style.display = 'none';
    }

    uiManager.showModal('stepExecutionModal');
  },

  /**
   * Close step execution modal
   */
  closeStepExecution() {
    jobManager.editingStep = null;
    uiManager.hideModal('stepExecutionModal');
  },

  /**
   * Start step
   */
  startStep() {
    const job = jobManager.editingJob;
    const { stageIndex, stepIndex } = jobManager.editingStep;

    if (jobManager.startStep(job, stageIndex, stepIndex)) {
      this.closeStepExecution();
      this.openJobDetail(job.jobId);
      alert('Step started!');
    } else {
      alert('Cannot start this step. Please complete all required dependencies first.');
    }
  },

  /**
   * Complete step
   */
  completeStep() {
    const job = jobManager.editingJob;
    const { stageIndex, stepIndex, step } = jobManager.editingStep;

    // Get checklist data
    const checkboxes = document.querySelectorAll('#stepChecklistItems input[type="checkbox"]');
    const checklist = Array.from(checkboxes).map((checkbox, i) => ({
      item: step.checklist[i].item,
      checked: checkbox.checked,
      notes: step.checklist[i].notes
    }));

    // Check if all required items are checked
    const allChecked = checklist.every(item => item.checked);
    if (!allChecked) {
      if (!confirm('Not all checklist items are checked. Continue anyway?')) {
        return;
      }
    }

    // Get notes
    const notes = document.getElementById('stepNotes').value;

    // Get variable updates
    const template = templateManager.getById(job.templateId);
    const variables = {};
    if (template && template.variables) {
      template.variables.forEach(variable => {
        const input = document.getElementById(`var_${variable.variableId}`);
        if (input && input.value !== '') {
          variables[variable.variableId] = input.value;
        }
      });
    }

    // Complete step
    if (jobManager.completeStep(job, stageIndex, stepIndex, { checklist, notes, variables })) {
      this.closeStepExecution();
      this.openJobDetail(job.jobId);
      alert('Step completed!');
    } else {
      alert('Failed to complete step');
    }
  },

  // ==================== CONFIGURATION ====================

  /**
   * Apply industry preset
   */
  applyPreset() {
    const preset = document.getElementById('industryPreset').value;
    configManager.applyPreset(preset);
    uiManager.loadConfig();
  },

  /**
   * Save configuration
   */
  saveConfig() {
    // Get feature checkboxes
    Object.keys(configManager.config.features).forEach(key => {
      const checkbox = document.getElementById('feature_' + key);
      if (checkbox) {
        configManager.config.features[key] = checkbox.checked;
      }
    });

    configManager.saveConfig();
    alert('Configuration saved!');
  },

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    if (!confirm('Reset to default configuration?')) return;

    configManager.resetToDefaults();
    uiManager.loadConfig();
    alert('Configuration reset to defaults');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});