// Job Management System - Application Logic

const app = {
  currentUser: null,
  currentView: 'dashboard',
  config: null,
  data: {
    users: [],
    templates: [],
    jobs: []
  },
  editingTemplate: null,
  editingJob: null,
  editingStep: null,

  // Initialize app
  init() {
    this.loadConfig();
    this.loadData();
    this.checkAuth();
  },

  // Configuration Management
  loadConfig() {
    const saved = localStorage.getItem('systemConfig');
    if (saved) {
      this.config = JSON.parse(saved);
    } else {
      this.config = this.getDefaultConfig();
      this.saveConfigToStorage();
    }
  },

  getDefaultConfig() {
    return {
      clientId: 'demo_client',
      clientName: 'Demo Company',
      industry: 'general',
      features: {
        templates: true,
        stages: true,
        sequentialSteps: true,
        parallelExecution: false,
        conditionalSteps: false,
        customJobFields: false,
        complexRequirements: false,
        qaTemplates: false,
        teamAssignment: false,
        certificationTracking: false,
        excelImport: false,
        approvalGates: false,
        photoEvidence: true,
        barcodeScanning: false,
        notifications: false,
        reporting: false
      }
    };
  },

  saveConfigToStorage() {
    localStorage.setItem('systemConfig', JSON.stringify(this.config));
  },

  // Data Management
  loadData() {
    const saved = localStorage.getItem('appData');
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      this.initializeDemoData();
      this.saveData();
    }
  },

  saveData() {
    localStorage.setItem('appData', JSON.stringify(this.data));
  },

  initializeDemoData() {
    // Demo users
    this.data.users = [
      {
        userId: 'user_admin',
        username: 'admin',
        fullName: 'Admin User',
        email: 'admin@company.com',
        role: 'admin',
        active: true
      },
      {
        userId: 'user_supervisor',
        username: 'supervisor',
        fullName: 'Supervisor User',
        email: 'supervisor@company.com',
        role: 'supervisor',
        active: true
      },
      {
        userId: 'user_operator',
        username: 'operator',
        fullName: 'Operator User',
        email: 'operator@company.com',
        role: 'operator',
        active: true
      }
    ];

    // Demo template
    this.data.templates = [
      {
        templateId: 'template_001',
        templateName: 'Standard Manufacturing Job',
        description: 'Standard manufacturing process with prep, production, and QA stages',
        stages: [
          {
            stageId: 'stage_1',
            stageName: 'Preparation',
            order: 1,
            steps: [
              {
                stepId: 'step_1',
                stepName: 'Material Inspection',
                description: 'Verify raw materials meet specifications',
                order: 1,
                requirements: ['Raw materials', 'Inspection tools'],
                checklist: ['Material dimensions verified', 'No surface defects', 'Proper storage conditions']
              },
              {
                stepId: 'step_2',
                stepName: 'Equipment Setup',
                description: 'Prepare and calibrate equipment',
                order: 2,
                requirements: ['Equipment manual', 'Calibration tools'],
                checklist: ['Equipment cleaned', 'Calibration verified', 'Safety check completed']
              }
            ]
          },
          {
            stageId: 'stage_2',
            stageName: 'Production',
            order: 2,
            steps: [
              {
                stepId: 'step_3',
                stepName: 'Processing',
                description: 'Execute main processing operation',
                order: 1,
                requirements: ['Processed materials', 'Operating procedures'],
                checklist: ['Process parameters set', 'Quality check during processing', 'Process completed']
              }
            ]
          },
          {
            stageId: 'stage_3',
            stageName: 'Quality Control',
            order: 3,
            steps: [
              {
                stepId: 'step_4',
                stepName: 'Final Inspection',
                description: 'Final quality verification',
                order: 1,
                requirements: ['Inspection checklist', 'Measuring tools'],
                checklist: ['Dimensions within tolerance', 'Visual inspection passed', 'Documentation complete']
              }
            ]
          }
        ],
        createdAt: Date.now(),
        createdBy: 'user_admin'
      }
    ];

    // Demo job
    this.data.jobs = [];
  },

  // Authentication
  checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  login() {
    const username = document.getElementById('loginUsername').value;
    const role = document.getElementById('loginRole').value;
    
    if (!username) {
      alert('Please enter a username');
      return;
    }

    const user = this.data.users.find(u => u.username === username);
    if (user) {
      this.currentUser = user;
    } else {
      // Create new user if doesn't exist
      this.currentUser = {
        userId: 'user_' + Date.now(),
        username: username,
        fullName: username,
        email: username + '@company.com',
        role: role,
        active: true
      };
      this.data.users.push(this.currentUser);
      this.saveData();
    }

    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    this.showApp();
  },

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.showLogin();
  },

  showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
  },

  showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    document.getElementById('currentUser').textContent = this.currentUser.fullName + ' (' + this.currentUser.role + ')';
    this.updateNav();
    this.showView('dashboard');
  },

  // Navigation
  updateNav() {
    const role = this.currentUser.role;
    
    // Hide config for non-admins
    const configBtn = document.querySelector('[data-view="config"]');
    if (role !== 'admin') {
      configBtn.style.display = 'none';
    } else {
      configBtn.style.display = 'block';
    }

    // Hide template button for operators
    const templatesBtn = document.querySelector('[data-view="templates"]');
    if (role === 'operator') {
      templatesBtn.style.display = 'none';
    } else {
      templatesBtn.style.display = 'block';
    }
  },

  showView(viewName) {
    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(viewName + 'View').classList.add('active');

    this.currentView = viewName;

    // Load view data
    switch(viewName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'templates':
        this.loadTemplates();
        break;
      case 'jobs':
        this.loadJobs();
        break;
      case 'users':
        this.loadUsers();
        break;
      case 'config':
        this.loadConfig();
        this.renderConfig();
        break;
    }
  },

  // Dashboard
  loadDashboard() {
    const totalJobs = this.data.jobs.length;
    const activeJobs = this.data.jobs.filter(j => j.status === 'in-progress').length;
    const myJobs = this.data.jobs.filter(j => j.assignedTo === this.currentUser.userId).length;
    const templates = this.data.templates.length;

    document.getElementById('statTotalJobs').textContent = totalJobs;
    document.getElementById('statActiveJobs').textContent = activeJobs;
    document.getElementById('statMyJobs').textContent = myJobs;
    document.getElementById('statTemplates').textContent = templates;

    // My jobs list
    const myJobsList = document.getElementById('myJobsList');
    const assignedJobs = this.data.jobs.filter(j => j.assignedTo === this.currentUser.userId);
    
    if (assignedJobs.length === 0) {
      myJobsList.innerHTML = '<p style="color: #6b7280;">No jobs assigned to you</p>';
    } else {
      myJobsList.innerHTML = assignedJobs.map(job => `
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
            <div>Progress: ${this.calculateJobProgress(job)}%</div>
          </div>
          <div class="card-actions" style="margin-top: 10px;">
            <button class="btn-primary" onclick="app.openJobDetail('${job.jobId}')">View Job</button>
          </div>
        </div>
      `).join('');
    }

    // Recent activity (placeholder)
    document.getElementById('recentActivity').innerHTML = '<p style="color: #6b7280;">No recent activity</p>';
  },

  calculateJobProgress(job) {
    let totalSteps = 0;
    let completedSteps = 0;

    job.stageExecutions.forEach(stage => {
      stage.stepExecutions.forEach(step => {
        totalSteps++;
        if (step.status === 'completed') completedSteps++;
      });
    });

    return totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  },

  // Templates
  loadTemplates() {
    const templatesList = document.getElementById('templatesList');
    
    if (this.data.templates.length === 0) {
      templatesList.innerHTML = '<p style="color: #6b7280;">No templates created yet. Click "Create Template" to get started.</p>';
      return;
    }

    templatesList.innerHTML = this.data.templates.map(template => {
      const stageCount = template.stages.length;
      const stepCount = template.stages.reduce((sum, stage) => sum + stage.steps.length, 0);
      
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
          </div>
          <div class="card-actions" style="margin-top: 10px;">
            <button class="btn-primary" onclick="app.editTemplate('${template.templateId}')">Edit</button>
            <button class="btn-danger" onclick="app.deleteTemplate('${template.templateId}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  },

  showTemplateBuilder() {
    this.editingTemplate = {
      templateId: 'template_' + Date.now(),
      templateName: '',
      description: '',
      stages: [],
      createdAt: Date.now(),
      createdBy: this.currentUser.userId
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
    const stage = {
      stageId: 'stage_' + Date.now(),
      stageName: 'New Stage',
      order: this.editingTemplate.stages.length + 1,
      steps: []
    };
    this.editingTemplate.stages.push(stage);
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
    const step = {
      stepId: 'step_' + Date.now(),
      stepName: 'New Step',
      description: '',
      order: this.editingTemplate.stages[stageIndex].steps.length + 1,
      requirements: [],
      checklist: []
    };
    this.editingTemplate.stages[stageIndex].steps.push(step);
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

  deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    this.data.templates = this.data.templates.filter(t => t.templateId !== templateId);
    this.saveData();
    this.loadTemplates();
  },

  // Jobs
  loadJobs() {
    this.renderJobs();
  },

  filterJobs() {
    this.renderJobs();
  },

  renderJobs() {
    const jobsList = document.getElementById('jobsList');
    const statusFilter = document.getElementById('jobStatusFilter').value;
    const searchTerm = document.getElementById('jobSearchInput').value.toLowerCase();

    let filteredJobs = this.data.jobs;

    if (statusFilter !== 'all') {
      filteredJobs = filteredJobs.filter(j => j.status === statusFilter);
    }

    if (searchTerm) {
      filteredJobs = filteredJobs.filter(j => 
        j.jobName.toLowerCase().includes(searchTerm) ||
        j.orderNo.toLowerCase().includes(searchTerm) ||
        (j.client && j.client.toLowerCase().includes(searchTerm))
      );
    }

    if (filteredJobs.length === 0) {
      jobsList.innerHTML = '<p style="color: #6b7280;">No jobs found. Click "Create Job" to get started.</p>';
      return;
    }

    jobsList.innerHTML = filteredJobs.map(job => {
      const assignedUser = this.data.users.find(u => u.userId === job.assignedTo);
      const progress = this.calculateJobProgress(job);
      
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
          <div class="card-actions" style="margin-top: 10px;">
            <button class="btn-primary" onclick="app.openJobDetail('${job.jobId}')">View Details</button>
          </div>
        </div>
      `;
    }).join('');
  },

  showJobCreator() {
    // Populate template dropdown
    const templateSelect = document.getElementById('jobTemplate');
    templateSelect.innerHTML = '<option value="">-- Select Template --</option>' +
      this.data.templates.map(t => `<option value="${t.templateId}">${t.templateName}</option>`).join('');

    // Populate users dropdown
    const userSelect = document.getElementById('jobAssignedTo');
    userSelect.innerHTML = '<option value="">-- Unassigned --</option>' +
      this.data.users.filter(u => u.active).map(u => `<option value="${u.userId}">${u.fullName}</option>`).join('');

    // Clear form
    document.getElementById('jobName').value = '';
    document.getElementById('jobOrderNo').value = '';
    document.getElementById('jobClient').value = '';
    document.getElementById('jobDueDate').value = '';

    document.getElementById('jobCreatorModal').classList.remove('hidden');
  },

  closeJobCreator() {
    document.getElementById('jobCreatorModal').classList.add('hidden');
  },

  onTemplateSelected() {
    // Can add logic here if needed
  },

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

    const template = this.data.templates.find(t => t.templateId === templateId);
    if (!template) {
      alert('Template not found');
      return;
    }

    // Create job from template
    const job = {
      jobId: 'job_' + Date.now(),
      templateId: templateId,
      jobName: jobName,
      orderNo: orderNo,
      client: client,
      dueDate: dueDate,
      assignedTo: assignedTo,
      status: 'pending',
      createdAt: Date.now(),
      createdBy: this.currentUser.userId,
      stageExecutions: template.stages.map(stage => ({
        stageId: stage.stageId,
        stageName: stage.stageName,
        status: 'pending',
        stepExecutions: stage.steps.map(step => ({
          stepId: step.stepId,
          stepName: step.stepName,
          description: step.description,
          requirements: [...step.requirements],
          checklist: step.checklist.map(item => ({ item, checked: false, notes: '' })),
          status: 'pending',
          assignedTo: assignedTo,
          notes: ''
        }))
      }))
    };

    this.data.jobs.push(job);
    this.saveData();
    this.closeJobCreator();
    this.loadJobs();
    
    alert('Job created successfully!');
  },

  openJobDetail(jobId) {
    const job = this.data.jobs.find(j => j.jobId === jobId);
    if (!job) return;

    this.editingJob = job;

    document.getElementById('jobDetailTitle').textContent = job.jobName;
    document.getElementById('jobDetailOrderNo').textContent = job.orderNo;
    document.getElementById('jobDetailClient').textContent = job.client || 'N/A';
    document.getElementById('jobDetailDueDate').textContent = job.dueDate || 'Not set';
    document.getElementById('jobDetailStatus').textContent = job.status;
    document.getElementById('jobDetailStatus').className = 'badge badge-' + job.status;
    
    const assignedUser = this.data.users.find(u => u.userId === job.assignedTo);
    document.getElementById('jobDetailAssignedTo').textContent = assignedUser ? assignedUser.fullName : 'Unassigned';

    // Render stages and steps
    const stagesList = document.getElementById('jobStagesList');
    stagesList.innerHTML = job.stageExecutions.map((stage, stageIndex) => {
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
                  <div class="step-meta">
                    ${step.description}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="badge badge-${step.status}">${step.status}</span>
                  <button class="btn-primary" onclick="app.openStepExecution(${stageIndex}, ${stepIndex})">
                    ${step.status === 'pending' ? 'Start' : 'View'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('jobDetailModal').classList.remove('hidden');
  },

  closeJobDetail() {
    this.editingJob = null;
    document.getElementById('jobDetailModal').classList.add('hidden');
  },

  openStepExecution(stageIndex, stepIndex) {
    const job = this.editingJob;
    const step = job.stageExecutions[stageIndex].stepExecutions[stepIndex];
    
    this.editingStep = { stageIndex, stepIndex, step };

    document.getElementById('stepExecutionTitle').textContent = step.stepName;
    document.getElementById('stepDescription').textContent = step.description || 'No description';
    document.getElementById('stepCurrentStatus').textContent = step.status;
    document.getElementById('stepCurrentStatus').className = 'badge badge-' + step.status;

    // Requirements
    const requirementsDiv = document.getElementById('stepRequirements');
    if (step.requirements.length > 0) {
      requirementsDiv.innerHTML = '<h3>Requirements</h3><ul>' +
        step.requirements.map(req => `<li>${req}</li>`).join('') +
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

    // Buttons
    const btnStart = document.getElementById('btnStartStep');
    const btnComplete = document.getElementById('btnCompleteStep');
    
    if (step.status === 'pending') {
      btnStart.style.display = 'inline-block';
      btnComplete.style.display = 'none';
    } else if (step.status === 'in-progress') {
      btnStart.style.display = 'none';
      btnComplete.style.display = 'inline-block';
    } else {
      btnStart.style.display = 'none';
      btnComplete.style.display = 'none';
    }

    document.getElementById('stepExecutionModal').classList.remove('hidden');
  },

  closeStepExecution() {
    this.editingStep = null;
    document.getElementById('stepExecutionModal').classList.add('hidden');
  },

  startStep() {
    const { stageIndex, stepIndex, step } = this.editingStep;
    
    step.status = 'in-progress';
    step.startedAt = Date.now();
    step.startedBy = this.currentUser.userId;
    
    // Update job status if first step
    if (this.editingJob.status === 'pending') {
      this.editingJob.status = 'in-progress';
    }

    this.saveData();
    this.closeStepExecution();
    this.openJobDetail(this.editingJob.jobId);
    
    alert('Step started!');
  },

  completeStep() {
    const { stageIndex, stepIndex, step } = this.editingStep;
    
    // Get checklist data
    const checkboxes = document.querySelectorAll('#stepChecklistItems input[type="checkbox"]');
    checkboxes.forEach((checkbox, i) => {
      step.checklist[i].checked = checkbox.checked;
    });

    // Check if all required checklist items are checked
    const allChecked = step.checklist.every(item => item.checked);
    if (!allChecked) {
      if (!confirm('Not all checklist items are checked. Continue anyway?')) {
        return;
      }
    }

    // Get notes
    step.notes = document.getElementById('stepNotes').value;

    step.status = 'completed';
    step.completedAt = Date.now();
    step.completedBy = this.currentUser.userId;

    // Check if stage is complete
    const stage = this.editingJob.stageExecutions[stageIndex];
    const allStepsComplete = stage.stepExecutions.every(s => s.status === 'completed');
    if (allStepsComplete) {
      stage.status = 'completed';
    }

    // Check if job is complete
    const allStagesComplete = this.editingJob.stageExecutions.every(s => s.status === 'completed');
    if (allStagesComplete) {
      this.editingJob.status = 'completed';
    }

    this.saveData();
    this.closeStepExecution();
    this.openJobDetail(this.editingJob.jobId);
    
    alert('Step completed!');
  },

  // Users
  loadUsers() {
    const usersList = document.getElementById('usersList');
    
    usersList.innerHTML = this.data.users.map(user => `
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

  showUserCreator() {
    alert('User creation form - To be implemented');
  },

  // Config
  renderConfig() {
    document.getElementById('industryPreset').value = this.config.industry;

    const featuresDiv = document.getElementById('configFeatures');
    const features = this.config.features;

    featuresDiv.innerHTML = Object.keys(features).map(key => `
      <div class="config-feature">
        <input type="checkbox" id="feature_${key}" ${features[key] ? 'checked' : ''}>
        <label for="feature_${key}">${this.formatFeatureName(key)}</label>
      </div>
    `).join('');
  },

  formatFeatureName(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  },

  applyPreset() {
    const preset = document.getElementById('industryPreset').value;
    this.config.industry = preset;

    const presets = {
      general: {
        parallelExecution: false,
        conditionalSteps: false,
        customJobFields: false,
        complexRequirements: false,
        qaTemplates: false,
        teamAssignment: false,
        certificationTracking: false,
        excelImport: false,
        approvalGates: false,
        photoEvidence: true,
        barcodeScanning: false,
        notifications: false,
        reporting: false
      },
      manufacturing: {
        parallelExecution: true,
        conditionalSteps: true,
        customJobFields: true,
        complexRequirements: true,
        qaTemplates: true,
        teamAssignment: true,
        certificationTracking: true,
        excelImport: true,
        approvalGates: false,
        photoEvidence: true,
        barcodeScanning: true,
        notifications: true,
        reporting: true
      },
      food: {
        parallelExecution: false,
        conditionalSteps: false,
        customJobFields: true,
        complexRequirements: false,
        qaTemplates: true,
        teamAssignment: false,
        certificationTracking: true,
        excelImport: false,
        approvalGates: true,
        photoEvidence: true,
        barcodeScanning: true,
        notifications: true,
        reporting: true
      }
    };

    Object.assign(this.config.features, presets[preset]);
    this.renderConfig();
  },

  saveConfig() {
    // Get feature checkboxes
    Object.keys(this.config.features).forEach(key => {
      const checkbox = document.getElementById('feature_' + key);
      if (checkbox) {
        this.config.features[key] = checkbox.checked;
      }
    });

    this.saveConfigToStorage();
    alert('Configuration saved!');
  },

  resetToDefaults() {
    if (!confirm('Reset to default configuration?')) return;
    
    this.config = this.getDefaultConfig();
    this.saveConfigToStorage();
    this.renderConfig();
    alert('Configuration reset to defaults');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
