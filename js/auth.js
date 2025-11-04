// Job Management System - Authentication

const authManager = {
  currentUser: null,

  /**
   * Initialize authentication
   */
  init() {
    this.checkAuth();
  },

  /**
   * Check if user is authenticated
   */
  checkAuth() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      return true;
    }
    return false;
  },

  /**
   * Login user
   * @param {string} username - Username
   * @param {string} role - User role
   * @returns {boolean} Whether login was successful
   */
  login(username, role) {
    if (!username || !role) {
      return false;
    }

    // Find or create user
    let user = dataManager.getUsers().find(u => u.username === username);
    
    if (!user) {
      // Create new user
      user = {
        userId: utils.generateId('user'),
        username: username,
        fullName: username.charAt(0).toUpperCase() + username.slice(1) + ' User',
        email: `${username}@company.com`,
        role: role,
        active: true
      };
      dataManager.data.users.push(user);
      dataManager.saveData();
    }

    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  },

  /**
   * Logout current user
   */
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  },

  /**
   * Get current user
   * @returns {object|null} Current user or null
   */
  getCurrentUser() {
    return this.currentUser;
  },

  /**
   * Check if current user has role
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has role
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  },

  /**
   * Check if current user is admin
   * @returns {boolean} Whether user is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  },

  /**
   * Check if current user is supervisor
   * @returns {boolean} Whether user is supervisor or admin
   */
  isSupervisor() {
    return this.hasRole('admin') || this.hasRole('supervisor');
  },

  /**
   * Check if current user is operator
   * @returns {boolean} Whether user is operator
   */
  isOperator() {
    return this.hasRole('operator');
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = authManager;
}
