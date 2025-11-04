// Job Management System - UI Management

const uiManager = {
  currentView: 'dashboard',

  /**
   * Initialize UI
   */
  init() {
    // Set up view switching
    this.setupViewSwitching();
  },

  /**
   * Setup view switching functionality
   */
  setupViewSwitching() {
    document.querySelectorAll('[data-view]').forEach(button => {
      button.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        this.switchView(view);
      });
    });
  },

  /**
   * Switch to different view
   * @param {string} viewName - View name
   */
  switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-content').forEach(view => {
      view.classList.add('hidden');
    });

    // Show selected view
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
      viewElement.classList.remove('hidden');
      this.currentView = viewName;
    }

    // Update nav buttons
    document.querySelectorAll('[data-view]').forEach(button => {
      button.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

    // Load view data
    this.loadView(viewName);
  },

  /**
   * Load view data
   * @param {string} viewName - View name
   */
  loadView(viewName) {
    switch (viewName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'jobs':
        this.loadJobs();
        break;
      case 'templates':
        this.loadTemplates();
        break;
      case 'users':
        this.loadUsers();
        break;
      case 'config':
        this.loadConfig();
        break;
    }
  },

  /**
   * Load dashboard
   */
  loadDashboard() {
    const jobs = jobManager.getAll();
    const user = authManager.getCurrentUser();

    // Stats
    document.getElementById('totalJobs').textContent = jobs.length;
    document.getElementById('activeJobs').textContent = jobs.filter(j => j.status === 'in-progress').length;
    document.getElementById('completedJobs').textContent = jobs.filter(j => j.status === 'completed').length;

    // My jobs
    if (user) {
      const myJobs = jobs.filter(j => j.assignedTo === user.userId);
      this.renderMyJobs(myJobs);
    }
  },

  /**
   * Render my jobs on dashboard
   * @param {Array} jobs - Array of jobs
   */
  renderMyJobs(jobs) {
    const container = document.getElementById('myJobsList');
    if (!container) return;

    if (jobs.length === 0) {
      container.innerHTML = '<p style="color: #6b7280;">No jobs assigned to you.</p>';
      return;
    }

    container.innerHTML = jobs.map(job => `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${job.jobName}</div>
            <div style="font-size: 12px; color: #6b7280;">${job.orderNo}</div>
          </div>
          <span class="badge badge-${job.status}">${job.status}</span>
        </div>
        <div class="card-content">
          <div>Due: ${job.dueDate || 'Not set'}</div>
          <div>Progress: ${utils.calculateJobProgress(job)}%</div>
        </div>
        <div class="card-actions">
          <button class="btn-primary" onclick="app.openJobDetail('${job.jobId}')">View Job</button>
        </div>
      </div>
    `).join('');
  },

  /**
   * Load jobs view
   */
  loadJobs() {
    this.renderJobs();
  },

  /**
   * Render jobs list
   */
  renderJobs() {
    const container = document.getElementById('jobsList');
    if (!container) return;

    const statusFilter = document.getElementById('jobStatusFilter')?.value || 'all';
    const searchTerm = (document.getElementById('jobSearchInput')?.value || '').toLowerCase();

    let jobs = jobManager.getAll();

    // Apply filters
    if (statusFilter !== 'all') {
      jobs = jobs.filter(j => j.status === statusFilter);
    }

    if (searchTerm) {
      jobs = jobs.filter(j =>
        j.jobName.toLowerCase().includes(searchTerm) ||
        j.orderNo.toLowerCase().includes(searchTerm) ||
        (j.client && j.client.toLowerCase().includes(searchTerm))
      );
    }

    if (jobs.length === 0) {
      container.innerHTML = '<p style="color: #6b7280;">No jobs found. Click "Create Job" to get started.</p>';
      return;
    }

    container.innerHTML = jobs.map(job => {
      const assignedUser = dataManager.getUserById(job.assignedTo);
      const progress = utils.calculateJobProgress(job);

      return `
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">${job.jobName}</div>
              <div style="font-size: 12px; color: #6b7280;">${job.orderNo}</div>
            </div>
            <span class="badge badge-${job.status}">${job.status}</span>
          </div>
          <div class="card-content">
            <div><strong>Client:</strong> ${job.client || 'N/A'}</div>
            <div><strong>Due:</strong> ${job.dueDate || 'Not set'}</div>
            <div><strong>Assigned:</strong> ${assignedUser ? assignedUser.fullName : 'Unassigned'}</div>
            <div><strong>Progress:</strong> ${progress}%</div>
          </div>
          <div class="card-actions">
            <button class="btn-primary" onclick="app.openJobDetail('${job.jobId}')">View Details</button>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Load templates view
   */
  loadTemplates() {
    this.renderTemplates();
  },

  /**
   * Render templates list
   */
  renderTemplates() {
    const container = document.getElementById('templatesList');
    if (!container) return;

    const templates = templateManager.getAll();

    if (templates.length === 0) {
      container.innerHTML = '<p style="color: #6b7280;">No templates yet. Create one or import from JSON.</p>';
      return;
    }

    container.innerHTML = templates.map(template => {
      const stageCount = template.stages?.length || 0;
      const stepCount = template.stages?.reduce((sum, stage) => sum + (stage.steps?.length || 0), 0) || 0;
      const paramCount = template.parameters?.length || 0;
      const varCount = template.variables?.length || 0;

      return `
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">${template.templateName}</div>
              <div style="font-size: 12px; color: #6b7280;">${template.description || 'No description'}</div>
            </div>
          </div>
          <div class="card-content">
            <div>${stageCount} stages, ${stepCount} steps</div>
            <div>${paramCount} parameters, ${varCount} variables</div>
          </div>
          <div class="card-actions">
            <button class="btn-secondary" onclick="app.showTemplateBuilder('${template.templateId}')">Edit</button>
            <button class="btn-secondary" onclick="app.duplicateTemplate('${template.templateId}')">Duplicate</button>
            <button class="btn-secondary" onclick="app.exportTemplate('${template.templateId}')">Export</button>
            <button class="btn-danger" onclick="app.deleteTemplate('${template.templateId}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Load users view
   */
  loadUsers() {
    const container = document.getElementById('usersList');
    if (!container) return;

    const users = dataManager.getUsers();

    container.innerHTML = users.map(user => `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${user.fullName}</div>
            <div style="font-size: 12px; color: #6b7280;">${user.email}</div>
          </div>
          <span class="badge badge-${user.active ? 'completed' : 'pending'}">
            ${user.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div class="card-content">
          <div><strong>Username:</strong> ${user.username}</div>
          <div><strong>Role:</strong> ${user.role}</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Load config view
   */
  loadConfig() {
    const industrySelect = document.getElementById('industryPreset');
    if (industrySelect) {
      industrySelect.value = configManager.config.industry;
    }

    const featuresDiv = document.getElementById('configFeatures');
    if (featuresDiv) {
      const features = configManager.config.features;
      featuresDiv.innerHTML = Object.keys(features).map(key => `
        <div class="config-feature">
          <input type="checkbox" id="feature_${key}" ${features[key] ? 'checked' : ''}>
          <label for="feature_${key}">${configManager.formatFeatureName(key)}</label>
        </div>
      `).join('');
    }
  },
  renderJobDetail(job){

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
    this.renderJobStages(job);
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
   * Show modal
   * @param {string} modalId - Modal ID
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  },

  /**
   * Hide modal
   * @param {string} modalId - Modal ID
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = uiManager;
}
