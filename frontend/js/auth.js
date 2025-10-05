/**
 * Authentication module for Todo Application
 * Handles login, registration, and authentication state
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;

    // Bind methods
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleLogout = this.handleLogout.bind(this);

    // Initialize
    this.init();
  }

  /**
   * Initialize authentication manager
   */
  async init() {
    try {
      // Check for existing token
      const token = localStorage.getItem("token");
      if (token) {
        // Verify token with server
        await this.verifyToken();
      }
    } catch (error) {
      console.warn("Auth initialization error:", error);
      this.clearAuth();
    } finally {
      this.isInitialized = true;
    }
  }

  /**
   * Verify JWT token with server
   */
  async verifyToken() {
    try {
      const response = await api.verifyToken();
      this.currentUser = response.user;
      this.updateUserDisplay();
      return true;
    } catch (error) {
      console.warn("Token verification failed:", error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Handle user login
   * @param {Event} event - Form submit event
   */
  async handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const loginBtn = document.getElementById("login-btn");

    // Clear previous errors
    this.clearFormErrors("login");

    // Validate form
    if (!this.validateLoginForm(email, password)) {
      return;
    }

    try {
      setButtonLoading(loginBtn, true);

      const response = await api.login(email, password);

      // Store user data
      this.currentUser = response.user;
      this.updateUserDisplay();

      // Show success message
      showSuccess("Login successful! Redirecting...");

      // Redirect to todos page
      setTimeout(() => {
        router.navigate("/todos");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      this.handleAuthError(error, "login");
    } finally {
      setButtonLoading(loginBtn, false);
    }
  }

  /**
   * Handle user registration
   * @param {Event} event - Form submit event
   */
  async handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const registerBtn = document.getElementById("register-btn");

    // Clear previous errors
    this.clearFormErrors("register");

    // Validate form
    if (
      !this.validateRegisterForm(username, email, password, confirmPassword)
    ) {
      return;
    }

    try {
      setButtonLoading(registerBtn, true);

      const response = await api.register(username, email, password);

      // Store user data
      this.currentUser = response.user;
      this.updateUserDisplay();

      // Show success message
      showSuccess("Registration successful! Redirecting...");

      // Redirect to todos page
      setTimeout(() => {
        router.navigate("/todos");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      this.handleAuthError(error, "register");
    } finally {
      setButtonLoading(registerBtn, false);
    }
  }

  /**
   * Handle user logout
   */
  async handleLogout() {
    try {
      await api.logout();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      this.clearAuth();
      showSuccess("Logged out successfully");
      router.navigate("/login");
    }
  }

  /**
   * Validate login form
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {boolean} True if valid
   */
  validateLoginForm(email, password) {
    let isValid = true;

    // Validate email
    if (!email) {
      this.showFieldError("login-email-error", "Email is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      this.showFieldError(
        "login-email-error",
        "Please enter a valid email address"
      );
      isValid = false;
    }

    // Validate password
    if (!password) {
      this.showFieldError("login-password-error", "Password is required");
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validate registration form
   * @param {string} username - Username
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} confirmPassword - Password confirmation
   * @returns {boolean} True if valid
   */
  validateRegisterForm(username, email, password, confirmPassword) {
    let isValid = true;

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      this.showFieldError(
        "register-username-error",
        usernameValidation.message
      );
      isValid = false;
    }

    // Validate email
    if (!email) {
      this.showFieldError("register-email-error", "Email is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      this.showFieldError(
        "register-email-error",
        "Please enter a valid email address"
      );
      isValid = false;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      this.showFieldError(
        "register-password-error",
        passwordValidation.message
      );
      isValid = false;
    }

    // Validate password confirmation
    if (!confirmPassword) {
      this.showFieldError(
        "register-confirm-password-error",
        "Please confirm your password"
      );
      isValid = false;
    } else if (password !== confirmPassword) {
      this.showFieldError(
        "register-confirm-password-error",
        "Passwords do not match"
      );
      isValid = false;
    }

    return isValid;
  }

  /**
   * Show field error message
   * @param {string} errorId - Error element ID
   * @param {string} message - Error message
   */
  showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /**
   * Clear form errors
   * @param {string} formType - Form type ('login' or 'register')
   */
  clearFormErrors(formType) {
    const errorElements = document.querySelectorAll(
      `#${formType}-form .field-error`
    );
    errorElements.forEach((element) => {
      element.textContent = "";
    });
  }

  /**
   * Handle authentication errors
   * @param {Error} error - Authentication error
   * @param {string} formType - Form type ('login' or 'register')
   */
  handleAuthError(error, formType) {
    if (error.isAuthError) {
      if (error.status === 401) {
        showError("Invalid email or password");
      } else if (error.status === 403) {
        showError("Account is disabled. Please contact support.");
      } else {
        showError("Authentication failed. Please try again.");
      }
    } else if (error.isValidationError) {
      // Handle validation errors from server
      if (error.data && error.data.errors) {
        Object.keys(error.data.errors).forEach((field) => {
          const errorId = `${formType}-${field}-error`;
          this.showFieldError(errorId, error.data.errors[field]);
        });
      } else {
        showError(error.message || "Please check your input and try again.");
      }
    } else if (error.isNetworkError) {
      showError("Network error. Please check your connection and try again.");
    } else {
      showError("An unexpected error occurred. Please try again.");
    }
  }

  /**
   * Update user display in UI
   */
  updateUserDisplay() {
    const userNameElement = document.getElementById("user-name");
    if (userNameElement && this.currentUser) {
      userNameElement.textContent =
        this.currentUser.username || this.currentUser.email;
    }
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.currentUser = null;
    api.setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.currentUser && !!api.getToken();
  }

  /**
   * Get current user
   * @returns {Object|null} Current user object
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Setup authentication event listeners
   */
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", this.handleLogin);
    }

    // Registration form
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", this.handleRegister);
    }

    // Logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", this.handleLogout);
    }

    // Error close buttons
    const errorCloseBtn = document.getElementById("error-close");
    if (errorCloseBtn) {
      errorCloseBtn.addEventListener("click", hideError);
    }

    const successCloseBtn = document.getElementById("success-close");
    if (successCloseBtn) {
      successCloseBtn.addEventListener("click", hideSuccess);
    }

    // Clear errors when user starts typing
    this.setupFormValidation();
  }

  /**
   * Setup real-time form validation
   */
  setupFormValidation() {
    // Login form validation
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");

    if (loginEmail) {
      loginEmail.addEventListener("input", () => {
        this.clearFieldError("login-email-error");
      });
    }

    if (loginPassword) {
      loginPassword.addEventListener("input", () => {
        this.clearFieldError("login-password-error");
      });
    }

    // Registration form validation
    const registerUsername = document.getElementById("register-username");
    const registerEmail = document.getElementById("register-email");
    const registerPassword = document.getElementById("register-password");
    const registerConfirmPassword = document.getElementById(
      "register-confirm-password"
    );

    if (registerUsername) {
      registerUsername.addEventListener("input", () => {
        this.clearFieldError("register-username-error");
      });
    }

    if (registerEmail) {
      registerEmail.addEventListener("input", () => {
        this.clearFieldError("register-email-error");
      });
    }

    if (registerPassword) {
      registerPassword.addEventListener("input", () => {
        this.clearFieldError("register-password-error");
        // Clear confirm password error if passwords match
        if (
          registerConfirmPassword &&
          registerPassword.value === registerConfirmPassword.value
        ) {
          this.clearFieldError("register-confirm-password-error");
        }
      });
    }

    if (registerConfirmPassword) {
      registerConfirmPassword.addEventListener("input", () => {
        this.clearFieldError("register-confirm-password-error");
      });
    }
  }

  /**
   * Clear field error
   * @param {string} errorId - Error element ID
   */
  clearFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }
}

// Create global auth manager instance
const auth = new AuthManager();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AuthManager, auth };
}
