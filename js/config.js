// Job Management System - Configuration Management

const configManager = {
  config: null,

  /**
   * Initialize configuration
   */
  init() {
    this.loadConfig();
  },

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    const saved = localStorage.getItem('systemConfig');
    if (saved) {
      this.config = JSON.parse(saved);
    } else {
      this.config = this.getDefaultConfig();
      this.saveConfig();
    }
  },

  /**
   * Get default configuration
   * @returns {object} Default configuration
   */
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
        jobParameters: false,  // UPDATED: Changed from customJobFields
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

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    localStorage.setItem('systemConfig', JSON.stringify(this.config));
  },

  /**
   * Get industry preset configuration
   * @param {string} industry - Industry name (general, manufacturing, food)
   * @returns {object} Industry-specific feature settings
   */
  getIndustryPreset(industry) {
    const presets = {
      general: {
        parallelExecution: false,
        conditionalSteps: false,
        jobParameters: false,  // UPDATED
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
        jobParameters: true,  // UPDATED
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
        jobParameters: true,  // UPDATED
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

    return presets[industry] || presets.general;
  },

  /**
   * Apply industry preset
   * @param {string} industry - Industry name
   */
  applyPreset(industry) {
    this.config.industry = industry;
    const preset = this.getIndustryPreset(industry);
    Object.assign(this.config.features, preset);
    this.saveConfig();
  },

  /**
   * Update feature flag
   * @param {string} featureName - Feature name
   * @param {boolean} enabled - Whether feature is enabled
   */
  updateFeature(featureName, enabled) {
    if (this.config.features.hasOwnProperty(featureName)) {
      this.config.features[featureName] = enabled;
      this.saveConfig();
    }
  },

  /**
   * Check if feature is enabled
   * @param {string} featureName - Feature name
   * @returns {boolean} Whether feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.config.features[featureName] === true;
  },

  /**
   * Format feature name for display
   * @param {string} key - Feature key
   * @returns {string} Formatted feature name
   */
  formatFeatureName(key) {
    // Special cases
    const specialCases = {
      'jobParameters': 'Job Parameters',  // UPDATED
      'qaTemplates': 'QA Templates',
      'excelImport': 'Excel Import'
    };
    
    if (specialCases[key]) {
      return specialCases[key];
    }
    
    // Convert camelCase to Title Case
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  },

  /**
   * Reset to default configuration
   */
  resetToDefaults() {
    this.config = this.getDefaultConfig();
    this.saveConfig();
  },

  /**
   * Export configuration as JSON
   * @returns {string} JSON string of configuration
   */
  exportConfig() {
    return JSON.stringify(this.config, null, 2);
  },

  /**
   * Import configuration from JSON
   * @param {string} jsonString - JSON configuration string
   * @returns {boolean} Whether import was successful
   */
  importConfig(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      
      // Validate structure
      if (!imported.clientId || !imported.features) {
        return false;
      }
      
      this.config = imported;
      this.saveConfig();
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = configManager;
}
