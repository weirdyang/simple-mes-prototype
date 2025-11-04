// Job Management System - Utility Functions

const utils = {
  /**
   * Replace ${variableName} with actual values from parameters and variables
   * @param {string} text - Text containing ${...} placeholders
   * @param {object} parameters - Parameter values
   * @param {object} variables - Variable values
   * @returns {string} Text with substituted values
   */
  substituteVariables(text, parameters, variables) {
    if (!text) return text;
    
    let result = text;
    
    // Replace parameters ${parameterName}
    if (parameters) {
      Object.keys(parameters).forEach(key => {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        result = result.replace(regex, parameters[key]);
      });
    }
    
    // Replace variables ${variableName}
    if (variables) {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        result = result.replace(regex, variables[key]);
      });
    }
    
    return result;
  },

  /**
   * Evaluate stage condition (succeeded, failed, always)
   * @param {string} condition - Condition string (e.g., "succeeded()", "failed()", "always()")
   * @param {object} previousStage - Previous stage execution object
   * @returns {boolean} Whether condition is met
   */
  evaluateStageCondition(condition, previousStage) {
    if (!condition) return true; // Default to true if no condition
    
    const cond = condition.toLowerCase().trim();
    
    // Always execute
    if (cond === 'always()') return true;
    
    // Execute if previous stage succeeded
    if (cond === 'succeeded()') {
      return !previousStage || previousStage.status === 'completed';
    }
    
    // Execute if previous stage failed
    if (cond === 'failed()') {
      return previousStage && previousStage.status === 'failed';
    }
    
    // Default to true for unknown conditions
    return true;
  },

  /**
   * Parse value from string input (tries to infer type)
   * @param {string} value - String value to parse
   * @returns {any} Parsed value (number, boolean, or string)
   */
  parseValue(value) {
    if (value === '') return '';
    
    // Try to parse as number
    if (!isNaN(value) && value !== '') {
      return Number(value);
    }
    
    // Parse boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Try to parse as JSON (for objects/arrays)
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') return parsed;
    } catch (e) {
      // Not JSON, return as string
    }
    
    return value;
  },

  /**
   * Format date for display
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted date string
   */
  formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  },

  /**
   * Generate unique ID
   * @param {string} prefix - Prefix for ID
   * @returns {string} Unique ID
   */
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Deep clone object
   * @param {object} obj - Object to clone
   * @returns {object} Cloned object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Validate template structure
   * @param {object} template - Template to validate
   * @returns {object} {valid: boolean, errors: string[]}
   */
  validateTemplate(template) {
    const errors = [];
    
    if (!template.templateId) errors.push('Missing templateId');
    if (!template.templateName) errors.push('Missing templateName');
    if (!template.stages || !Array.isArray(template.stages)) {
      errors.push('Missing or invalid stages array');
    }
    
    // Validate stages
    if (template.stages) {
      template.stages.forEach((stage, i) => {
        if (!stage.stageId) errors.push(`Stage ${i}: Missing stageId`);
        if (!stage.stageName) errors.push(`Stage ${i}: Missing stageName`);
        if (!stage.steps || !Array.isArray(stage.steps)) {
          errors.push(`Stage ${i}: Missing or invalid steps array`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Migrate old template format to new format
   * @param {object} template - Template to migrate
   * @returns {object} Migrated template
   */
  migrateTemplate(template) {
    const migrated = utils.deepClone(template);
    
    // Migrate customFields to parameters
    if (migrated.customFields && !migrated.parameters) {
      migrated.parameters = migrated.customFields.map(field => ({
        parameterId: field.fieldId || field.parameterId,
        label: field.label,
        defaultValue: field.defaultValue,
        description: field.description
      }));
      delete migrated.customFields;
    }
    
    // Ensure variables array exists
    if (!migrated.variables) {
      migrated.variables = [];
    }
    
    // Ensure stages have condition field
    if (migrated.stages) {
      migrated.stages.forEach(stage => {
        if (!stage.condition) {
          stage.condition = 'succeeded()';
        }
      });
    }
    
    return migrated;
  },

  /**
   * Calculate job progress percentage
   * @param {object} job - Job object
   * @returns {number} Progress percentage (0-100)
   */
  calculateJobProgress(job) {
    if (!job.stageExecutions || job.stageExecutions.length === 0) return 0;
    
    let totalSteps = 0;
    let completedSteps = 0;
    
    job.stageExecutions.forEach(stage => {
      if (stage.stepExecutions) {
        totalSteps += stage.stepExecutions.length;
        completedSteps += stage.stepExecutions.filter(s => s.status === 'completed').length;
      }
    });
    
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }
};

// Export for module usage (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utils;
}
