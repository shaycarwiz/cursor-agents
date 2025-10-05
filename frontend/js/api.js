/**
 * API Client for Todo Application
 * Handles all communication with the backend API
 */

class ApiClient {
  constructor(baseURL = "http://localhost:3000/api") {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("token");
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  /**
   * Get authentication token
   * @returns {string|null} JWT token
   */
  getToken() {
    return this.token || localStorage.getItem("token");
  }

  /**
   * Make HTTP request to API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || "Request failed",
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError("Network error. Please check your connection.", 0, {
        originalError: error,
      });
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // Authentication Methods

  /**
   * User login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response with token
   */
  async login(email, password) {
    const response = await this.post("/auth/login", { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * User registration
   * @param {string} username - Username
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Registration response
   */
  async register(username, email, password) {
    const response = await this.post("/auth/register", {
      username,
      email,
      password,
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Verify JWT token
   * @returns {Promise} Token verification response
   */
  async verifyToken() {
    return this.get("/auth/verify");
  }

  /**
   * User logout
   * @returns {Promise} Logout response
   */
  async logout() {
    try {
      await this.post("/auth/logout");
    } finally {
      this.setToken(null);
    }
  }

  // Todo Methods

  /**
   * Get all todos for the authenticated user
   * @returns {Promise} Array of todos
   */
  async getTodos() {
    return this.get("/todos");
  }

  /**
   * Create a new todo
   * @param {string} title - Todo title
   * @param {string} description - Todo description (optional)
   * @returns {Promise} Created todo
   */
  async createTodo(title, description = "") {
    return this.post("/todos", { title, description });
  }

  /**
   * Update an existing todo
   * @param {number} id - Todo ID
   * @param {Object} updates - Todo updates
   * @returns {Promise} Updated todo
   */
  async updateTodo(id, updates) {
    return this.put(`/todos/${id}`, updates);
  }

  /**
   * Delete a todo
   * @param {number} id - Todo ID
   * @returns {Promise} Deletion response
   */
  async deleteTodo(id) {
    return this.delete(`/todos/${id}`);
  }

  /**
   * Mark todo as completed/incomplete
   * @param {number} id - Todo ID
   * @param {boolean} completed - Completion status
   * @returns {Promise} Updated todo
   */
  async toggleTodo(id, completed) {
    return this.updateTodo(id, { completed });
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  /**
   * Check if error is authentication related
   * @returns {boolean} True if authentication error
   */
  isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is validation related
   * @returns {boolean} True if validation error
   */
  isValidationError() {
    return this.status === 400;
  }

  /**
   * Check if error is server error
   * @returns {boolean} True if server error
   */
  isServerError() {
    return this.status >= 500;
  }

  /**
   * Check if error is network error
   * @returns {boolean} True if network error
   */
  isNetworkError() {
    return this.status === 0;
  }
}

// Create global API client instance
const api = new ApiClient();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ApiClient, ApiError, api };
}
