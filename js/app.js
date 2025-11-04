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
  showUserCreator() {
    alert('User creation form - To be implemented');
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

  /**
   * Show template builder modal
   * @param {string|null} templateId - Template ID to edit, null for new
   */
  showTemplateBuilder(templateId = null) {
    const template = templateId ? templateManager.getById(templateId) : null;
    templateBuilderUI.show(template);
  },

  /**
   * Import template from JSON
   */
  async importTemplate() {
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

  /**
   * Duplicate template
   * @param {string} templateId - Template ID
   */
  duplicateTemplate(templateId) {
    const duplicated = templateManager.duplicate(templateId);
    if (duplicated) {
      alert(`Template duplicated as "${duplicated.templateName}"`);
      uiManager.loadTemplates();
    } else {
      alert('Failed to duplicate template');
    }
  },

  /**
   * Export template to JSON
   * @param {string} templateId - Template ID
   */
  exportTemplate(templateId) {
    templateManager.downloadAsJSON(templateId);
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

    // Display job details
    uiManager.renderJobDetail(job);
    uiManager.showModal('jobDetailModal');
  },

  /**
   * Close job detail modal
   */
  closeJobDetail() {
    jobManager.editingJob = null;
    uiManager.hideModal('jobDetailModal');
  },

  /**
   * Delete job
   * @param {string} jobId - Job ID
   */
  deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    if (jobManager.delete(jobId)) {
      this.closeJobDetail();
      uiManager.loadJobs();
      alert('Job deleted');
    } else {
      alert('Failed to delete job');
    }
  },

  /**
   * Start step execution
   * @param {string} jobId - Job ID
   * @param {number} stageIndex - Stage index
   * @param {number} stepIndex - Step index
   */
  startStepExecution(jobId, stageIndex, stepIndex) {
    const job = jobManager.getById(jobId);
    if (!job) return;

    const success = jobManager.startStep(jobId, stageIndex, stepIndex);
    if (success) {
      this.openStepExecution(jobId, stageIndex, stepIndex);
    } else {
      alert('Cannot start this step yet. Complete previous steps first.');
    }
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

  /**
   * Close step execution modal
   */
  closeStepExecution() {
    uiManager.hideModal('stepExecutionModal');
  },


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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}