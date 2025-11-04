// Job Management System - Job Management

const jobManager = {
  editingJob: null,
  editingStep: null,

  /**
   * Get all jobs
   * @returns {Array} Array of jobs
   */
  getAll() {
    return dataManager.getJobs();
  },

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @returns {object|null} Job or null
   */
  getById(jobId) {
    return dataManager.getJobById(jobId);
  },

  /**
   * Get jobs by assigned user
   * @param {string} userId - User ID
   * @returns {Array} Array of jobs
   */
  getByUser(userId) {
    return dataManager.getJobsByUser(userId);
  },

  /**
   * Get jobs by status
   * @param {string} status - Job status
   * @returns {Array} Array of jobs
   */
  getByStatus(status) {
    return dataManager.getJobsByStatus(status);
  },

  /**
   * Create job from template
   * @param {object} options - Job creation options
   * @param {string} options.templateId - Template ID
   * @param {string} options.jobName - Job name
   * @param {string} options.orderNo - Order number
   * @param {string} options.client - Client name
   * @param {string} options.dueDate - Due date
   * @param {string} options.assignedTo - Assigned user ID
   * @param {object} options.parameters - Parameter values
   * @returns {object|null} Created job or null if failed
   */
  createFromTemplate(options) {
    const template = templateManager.getById(options.templateId);
    if (!template) {
      console.error('Template not found:', options.templateId);
      return null;
    }

    // Initialize parameters with defaults
    const parameters = {};
    if (template.parameters) {
      template.parameters.forEach(param => {
        parameters[param.parameterId] = options.parameters?.[param.parameterId] !== undefined
          ? options.parameters[param.parameterId]
          : param.defaultValue;
      });
    }

    // Initialize variables with defaults
    const variables = {};
    if (template.variables) {
      template.variables.forEach(variable => {
        variables[variable.variableId] = variable.defaultValue !== undefined 
          ? variable.defaultValue 
          : null;
      });
    }

    // Create job from template
    const job = {
      jobId: utils.generateId('job'),
      templateId: options.templateId,
      jobName: options.jobName,
      orderNo: options.orderNo,
      client: options.client || '',
      dueDate: options.dueDate || '',
      assignedTo: options.assignedTo || '',
      status: 'pending',
      createdAt: Date.now(),
      createdBy: authManager.getCurrentUser()?.userId || 'unknown',
      parameters: parameters,  // NEW: Store parameters
      variables: variables,    // NEW: Store variables
      stageExecutions: this._createStageExecutions(template, parameters, variables)
    };

    // Save job
    dataManager.saveJob(job);
    return job;
  },

  /**
   * Create stage executions from template stages
   * @private
   * @param {object} template - Template object
   * @param {object} parameters - Parameter values
   * @param {object} variables - Variable values
   * @returns {Array} Array of stage executions
   */
  _createStageExecutions(template, parameters, variables) {
    return template.stages.map(stage => ({
      stageId: stage.stageId,
      stageName: stage.stageName,
      dependencies: stage.dependencies || [],
      condition: stage.condition || 'succeeded()',  // NEW: Store condition
      conditionResult: null,  // Will be evaluated at runtime
      status: 'pending',
      stepExecutions: stage.steps.map(step => ({
        stepId: step.stepId,
        stepName: utils.substituteVariables(step.stepName, parameters, variables),  // NEW: Substitute
        description: utils.substituteVariables(step.description, parameters, variables),  // NEW: Substitute
        dependencies: step.dependencies || [],
        requirements: (step.requirements || []).map(req => 
          typeof req === 'string' ? utils.substituteVariables(req, parameters, variables) : req
        ),
        checklist: (step.checklist || []).map(item => ({
          item: typeof item === 'string' ? utils.substituteVariables(item, parameters, variables) : item,
          checked: false,
          notes: ''
        })),
        status: 'pending',
        assignedTo: '',
        notes: ''
      }))
    }));
  },

  /**
   * Update job
   * @param {object} job - Job object to update
   * @returns {boolean} Whether update was successful
   */
  update(job) {
    dataManager.saveJob(job);
    return true;
  },

  /**
   * Delete job
   * @param {string} jobId - Job ID
   * @returns {boolean} Whether deletion was successful
   */
  delete(jobId) {
    return dataManager.deleteJob(jobId);
  },

  /**
   * Start step
   * @param {object} job - Job object
   * @param {number} stageIndex - Stage index
   * @param {number} stepIndex - Step index
   * @returns {boolean} Whether step was started successfully
   */
  startStep(job, stageIndex, stepIndex) {
    if (!this.canStartStep(job, stageIndex, stepIndex)) {
      return false;
    }

    const step = job.stageExecutions[stageIndex].stepExecutions[stepIndex];
    step.status = 'in-progress';
    step.startedAt = Date.now();
    step.startedBy = authManager.getCurrentUser()?.userId || 'unknown';

    // Update job status if this is the first step
    if (job.status === 'pending') {
      job.status = 'in-progress';
    }

    this.update(job);
    return true;
  },

  /**
   * Complete step
   * @param {object} job - Job object
   * @param {number} stageIndex - Stage index
   * @param {number} stepIndex - Step index
   * @param {object} options - Completion options
   * @param {object} options.checklist - Checklist states
   * @param {string} options.notes - Completion notes
   * @param {object} options.variables - Updated variable values
   * @returns {boolean} Whether step was completed successfully
   */
  completeStep(job, stageIndex, stepIndex, options = {}) {
    const step = job.stageExecutions[stageIndex].stepExecutions[stepIndex];
    
    if (step.status !== 'in-progress') {
      return false;
    }

    // Update checklist
    if (options.checklist) {
      step.checklist = options.checklist;
    }

    // Update notes
    if (options.notes) {
      step.notes = options.notes;
    }

    // Update variables if provided
    if (options.variables) {
      Object.keys(options.variables).forEach(key => {
        if (job.variables.hasOwnProperty(key)) {
          job.variables[key] = utils.parseValue(options.variables[key]);
        }
      });

      // Re-substitute variables in remaining steps
      this._resubstituteVariables(job);
    }

    // Mark step as completed
    step.status = 'completed';
    step.completedAt = Date.now();
    step.completedBy = authManager.getCurrentUser()?.userId || 'unknown';

    // Check if stage is complete
    const stage = job.stageExecutions[stageIndex];
    const allStepsComplete = stage.stepExecutions.every(s => s.status === 'completed');
    if (allStepsComplete) {
      stage.status = 'completed';
    }

    // Check if job is complete
    const allStagesComplete = job.stageExecutions.every(s => {
      // Check if stage should be skipped due to condition
      if (s.condition) {
        const shouldRun = this._evaluateStageCondition(job, s);
        if (!shouldRun) return true; // Skip this stage, consider it "complete"
      }
      return s.status === 'completed';
    });
    
    if (allStagesComplete) {
      job.status = 'completed';
    }

    this.update(job);
    return true;
  },

  /**
   * Re-substitute variables in all pending steps
   * @private
   * @param {object} job - Job object
   */
  _resubstituteVariables(job) {
    const template = templateManager.getById(job.templateId);
    if (!template) return;

    job.stageExecutions.forEach((stage, stageIdx) => {
      const templateStage = template.stages.find(s => s.stageId === stage.stageId);
      if (!templateStage) return;

      stage.stepExecutions.forEach((step, stepIdx) => {
        if (step.status === 'pending') {
          const templateStep = templateStage.steps.find(s => s.stepId === step.stepId);
          if (templateStep) {
            step.stepName = utils.substituteVariables(templateStep.stepName, job.parameters, job.variables);
            step.description = utils.substituteVariables(templateStep.description, job.parameters, job.variables);
            
            // Re-substitute checklist items
            step.checklist.forEach((item, idx) => {
              const templateItem = templateStep.checklist?.[idx];
              if (typeof templateItem === 'string') {
                item.item = utils.substituteVariables(templateItem, job.parameters, job.variables);
              }
            });
          }
        }
      });
    });
  },

  /**
   * Check if step can be started
   * @param {object} job - Job object
   * @param {number} stageIndex - Stage index
   * @param {number} stepIndex - Step index
   * @returns {boolean} Whether step can be started
   */
  canStartStep(job, stageIndex, stepIndex) {
    const step = job.stageExecutions[stageIndex].stepExecutions[stepIndex];
    
    // Step must be pending
    if (step.status !== 'pending') {
      return false;
    }

    // Check stage condition
    const stage = job.stageExecutions[stageIndex];
    if (!this._evaluateStageCondition(job, stage)) {
      return false;
    }

    // Check step dependencies (within same stage)
    if (step.dependencies && step.dependencies.length > 0) {
      for (const depStepId of step.dependencies) {
        const depStep = this._findStep(job, depStepId);
        if (!depStep || depStep.status !== 'completed') {
          return false;
        }
      }
    }

    // Check stage dependencies (previous stages)
    if (stage.dependencies && stage.dependencies.length > 0) {
      for (const depStageId of stage.dependencies) {
        const depStage = this._findStage(job, depStageId);
        if (!depStage || depStage.status !== 'completed') {
          return false;
        }
      }
    }

    return true;
  },

  /**
   * Evaluate stage condition
   * @private
   * @param {object} job - Job object
   * @param {object} stage - Stage execution object
   * @returns {boolean} Whether condition is met
   */
  _evaluateStageCondition(job, stage) {
    if (!stage.condition) return true;

    // Find previous stage (by dependencies or order)
    let previousStage = null;
    if (stage.dependencies && stage.dependencies.length > 0) {
      previousStage = this._findStage(job, stage.dependencies[0]);
    }

    return utils.evaluateStageCondition(stage.condition, previousStage);
  },

  /**
   * Find step by ID
   * @private
   * @param {object} job - Job object
   * @param {string} stepId - Step ID
   * @returns {object|null} Step execution or null
   */
  _findStep(job, stepId) {
    for (const stage of job.stageExecutions) {
      for (const step of stage.stepExecutions) {
        if (step.stepId === stepId) {
          return step;
        }
      }
    }
    return null;
  },

  /**
   * Find stage by ID
   * @private
   * @param {object} job - Job object
   * @param {string} stageId - Stage ID
   * @returns {object|null} Stage execution or null
   */
  _findStage(job, stageId) {
    return job.stageExecutions.find(s => s.stageId === stageId) || null;
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = jobManager;
}
