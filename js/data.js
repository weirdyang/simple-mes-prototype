// Job Management System - Data Management

const dataManager = {
  data: {
    users: [],
    templates: [],
    jobs: []
  },

  /**
   * Initialize data
   */
  init() {
    this.loadData();
  },

  /**
   * Load data from localStorage
   */
  loadData() {
    const saved = localStorage.getItem('appData');
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      this.initializeDemoData();
      this.saveData();
    }
  },

  /**
   * Save data to localStorage
   */
  saveData() {
    localStorage.setItem('appData', JSON.stringify(this.data));
  },

  /**
   * Initialize demo data
   */
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

    // Demo template with NO parameters (basic)
    this.data.templates = [
      {
        templateId: 'template_001',
        templateName: 'Standard Manufacturing Job',
        description: 'Standard manufacturing process with prep, production, and QA stages',
        parameters: [],  // UPDATED: Added parameters array
        variables: [],   // UPDATED: Added variables array
        stages: [
          {
            stageId: 'stage_1',
            stageName: 'Preparation',
            order: 1,
            dependencies: [],
            condition: 'succeeded()',  // UPDATED: Added condition
            steps: [
              {
                stepId: 'step_1',
                stepName: 'Material Inspection',
                description: 'Verify raw materials meet specifications',
                order: 1,
                dependencies: [],
                requirements: ['Raw materials', 'Inspection tools'],
                checklist: ['Material dimensions verified', 'No surface defects', 'Proper storage conditions']
              },
              {
                stepId: 'step_2',
                stepName: 'Equipment Setup',
                description: 'Prepare and calibrate equipment',
                order: 2,
                dependencies: ['step_1'],
                requirements: ['Equipment manual', 'Calibration tools'],
                checklist: ['Equipment cleaned', 'Calibration verified', 'Safety check completed']
              }
            ]
          },
          {
            stageId: 'stage_2',
            stageName: 'Production',
            order: 2,
            dependencies: ['stage_1'],
            condition: 'succeeded()',  // UPDATED: Added condition
            steps: [
              {
                stepId: 'step_3',
                stepName: 'Processing',
                description: 'Execute main processing operation',
                order: 1,
                dependencies: [],
                requirements: ['Processed materials', 'Operating procedures'],
                checklist: ['Process parameters set', 'Quality check during processing', 'Process completed']
              }
            ]
          },
          {
            stageId: 'stage_3',
            stageName: 'Quality Control',
            order: 3,
            dependencies: ['stage_2'],
            condition: 'succeeded()',  // UPDATED: Added condition
            steps: [
              {
                stepId: 'step_4',
                stepName: 'Final Inspection',
                description: 'Final quality verification',
                order: 1,
                dependencies: [],
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

    // No demo jobs - let user create them
    this.data.jobs = [];
  },

  /**
   * Get all users
   * @returns {Array} Array of users
   */
  getUsers() {
    return this.data.users;
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {object|null} User object or null
   */
  getUserById(userId) {
    return this.data.users.find(u => u.userId === userId) || null;
  },

  /**
   * Get all templates
   * @returns {Array} Array of templates
   */
  getTemplates() {
    return this.data.templates;
  },

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {object|null} Template object or null
   */
  getTemplateById(templateId) {
    return this.data.templates.find(t => t.templateId === templateId) || null;
  },

  /**
   * Add or update template
   * @param {object} template - Template object
   */
  saveTemplate(template) {
    const existingIndex = this.data.templates.findIndex(t => t.templateId === template.templateId);
    
    if (existingIndex >= 0) {
      this.data.templates[existingIndex] = template;
    } else {
      this.data.templates.push(template);
    }
    
    this.saveData();
  },

  /**
   * Delete template
   * @param {string} templateId - Template ID
   * @returns {boolean} Whether deletion was successful
   */
  deleteTemplate(templateId) {
    const initialLength = this.data.templates.length;
    this.data.templates = this.data.templates.filter(t => t.templateId !== templateId);
    
    if (this.data.templates.length < initialLength) {
      this.saveData();
      return true;
    }
    
    return false;
  },

  /**
   * Get all jobs
   * @returns {Array} Array of jobs
   */
  getJobs() {
    return this.data.jobs;
  },

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @returns {object|null} Job object or null
   */
  getJobById(jobId) {
    return this.data.jobs.find(j => j.jobId === jobId) || null;
  },

  /**
   * Get jobs by assigned user
   * @param {string} userId - User ID
   * @returns {Array} Array of jobs
   */
  getJobsByUser(userId) {
    return this.data.jobs.filter(j => j.assignedTo === userId);
  },

  /**
   * Get jobs by status
   * @param {string} status - Job status
   * @returns {Array} Array of jobs
   */
  getJobsByStatus(status) {
    return this.data.jobs.filter(j => j.status === status);
  },

  /**
   * Add or update job
   * @param {object} job - Job object
   */
  saveJob(job) {
    const existingIndex = this.data.jobs.findIndex(j => j.jobId === job.jobId);
    
    if (existingIndex >= 0) {
      this.data.jobs[existingIndex] = job;
    } else {
      this.data.jobs.push(job);
    }
    
    this.saveData();
  },

  /**
   * Delete job
   * @param {string} jobId - Job ID
   * @returns {boolean} Whether deletion was successful
   */
  deleteJob(jobId) {
    const initialLength = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter(j => j.jobId !== jobId);
    
    if (this.data.jobs.length < initialLength) {
      this.saveData();
      return true;
    }
    
    return false;
  },

  /**
   * Clear all data
   */
  clearAllData() {
    this.data = {
      users: [],
      templates: [],
      jobs: []
    };
    this.saveData();
  },

  /**
   * Export all data as JSON
   * @returns {string} JSON string of all data
   */
  exportData() {
    return JSON.stringify(this.data, null, 2);
  },

  /**
   * Import data from JSON
   * @param {string} jsonString - JSON data string
   * @returns {boolean} Whether import was successful
   */
  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      
      // Validate structure
      if (!imported.users || !imported.templates || !imported.jobs) {
        return false;
      }
      
      this.data = imported;
      this.saveData();
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dataManager;
}
