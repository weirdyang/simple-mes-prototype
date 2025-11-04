// Job Management System - Template Management

const templateManager = {
  editingTemplate: null,

  /**
   * Get all templates
   * @returns {Array} Array of templates
   */
  getAll() {
    return dataManager.getTemplates();
  },

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {object|null} Template or null
   */
  getById(templateId) {
    return dataManager.getTemplateById(templateId);
  },

  /**
   * Create new empty template
   * @returns {object} New template object
   */
  createNew() {
    return {
      templateId: utils.generateId('template'),
      templateName: '',
      description: '',
      parameters: [],  // NEW: Parameters array
      variables: [],   // NEW: Variables array
      stages: [],
      createdAt: Date.now(),
      createdBy: authManager.getCurrentUser()?.userId || 'unknown'
    };
  },

  /**
   * Save template
   * @param {object} template - Template to save
   * @returns {boolean} Whether save was successful
   */
  save(template) {
    try {
      // Validate template
      const validation = utils.validateTemplate(template);
      if (!validation.valid) {
        console.error('Template validation failed:', validation.errors);
        return false;
      }

      dataManager.saveTemplate(template);
      return true;
    } catch (e) {
      console.error('Error saving template:', e);
      return false;
    }
  },

  /**
   * Delete template
   * @param {string} templateId - Template ID
   * @returns {boolean} Whether deletion was successful
   */
  delete(templateId) {
    return dataManager.deleteTemplate(templateId);
  },

  /**
   * Import template from JSON file
   * @returns {Promise} Promise that resolves when import is complete
   */
  importFromJSON() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject('No file selected');
          return;
        }
        
        try {
          const text = await file.text();
          const template = JSON.parse(text);
          
          // Migrate old format if needed
          const migrated = utils.migrateTemplate(template);
          
          // Validate template structure
          const validation = utils.validateTemplate(migrated);
          if (!validation.valid) {
            reject('Invalid template format: ' + validation.errors.join(', '));
            return;
          }
          
          // Check if template already exists
          const existing = this.getById(migrated.templateId);
          if (existing) {
            const replace = confirm(`Template "${migrated.templateName}" already exists. Replace it?`);
            if (!replace) {
              reject('User cancelled replacement');
              return;
            }
          }
          
          // Save template
          const saved = this.save(migrated);
          if (saved) {
            resolve(migrated);
          } else {
            reject('Failed to save template');
          }
        } catch (error) {
          reject('Error parsing JSON file: ' + error.message);
        }
      };
      
      input.click();
    });
  },

  /**
   * Export template to JSON
   * @param {string} templateId - Template ID
   * @returns {string|null} JSON string or null if template not found
   */
  exportToJSON(templateId) {
    const template = this.getById(templateId);
    if (!template) return null;
    
    return JSON.stringify(template, null, 2);
  },

  /**
   * Download template as JSON file
   * @param {string} templateId - Template ID
   */
  downloadAsJSON(templateId) {
    const json = this.exportToJSON(templateId);
    if (!json) {
      alert('Template not found');
      return;
    }
    
    const template = this.getById(templateId);
    const filename = `${template.templateId}.json`;
    
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Duplicate template
   * @param {string} templateId - Template ID to duplicate
   * @returns {object|null} Duplicated template or null
   */
  duplicate(templateId) {
    const template = this.getById(templateId);
    if (!template) return null;
    
    const duplicated = utils.deepClone(template);
    duplicated.templateId = utils.generateId('template');
    duplicated.templateName = template.templateName + ' (Copy)';
    duplicated.createdAt = Date.now();
    duplicated.createdBy = authManager.getCurrentUser()?.userId || 'unknown';
    
    this.save(duplicated);
    return duplicated;
  },

  /**
   * Add stage to template
   * @param {object} template - Template object
   * @param {object} stage - Stage to add
   */
  addStage(template, stage) {
    if (!template.stages) {
      template.stages = [];
    }
    
    // Set order if not provided
    if (!stage.order) {
      stage.order = template.stages.length + 1;
    }
    
    // Set default condition if not provided
    if (!stage.condition) {
      stage.condition = 'succeeded()';
    }
    
    template.stages.push(stage);
  },

  /**
   * Remove stage from template
   * @param {object} template - Template object
   * @param {string} stageId - Stage ID to remove
   */
  removeStage(template, stageId) {
    template.stages = template.stages.filter(s => s.stageId !== stageId);
  },

  /**
   * Add parameter to template
   * @param {object} template - Template object
   * @param {object} parameter - Parameter to add
   */
  addParameter(template, parameter) {
    if (!template.parameters) {
      template.parameters = [];
    }
    template.parameters.push(parameter);
  },

  /**
   * Remove parameter from template
   * @param {object} template - Template object
   * @param {string} parameterId - Parameter ID to remove
   */
  removeParameter(template, parameterId) {
    template.parameters = template.parameters.filter(p => p.parameterId !== parameterId);
  },

  /**
   * Add variable to template
   * @param {object} template - Template object
   * @param {object} variable - Variable to add
   */
  addVariable(template, variable) {
    if (!template.variables) {
      template.variables = [];
    }
    template.variables.push(variable);
  },

  /**
   * Remove variable from template
   * @param {object} template - Template object
   * @param {string} variableId - Variable ID to remove
   */
  removeVariable(template, variableId) {
    template.variables = template.variables.filter(v => v.variableId !== variableId);
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = templateManager;
}
