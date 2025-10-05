/**
 * Main application entry point for Todo Application
 * Initializes the application and sets up routing
 */

class TodoApp {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;

    // Bind methods
    this.handleRouteChange = this.handleRouteChange.bind(this);
    this.handleBeforeRouteChange = this.handleBeforeRouteChange.bind(this);
    this.handleAfterRouteChange = this.handleAfterRouteChange.bind(this);

    // Initialize app
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      showLoading();

      // Wait for auth to initialize
      await this.waitForAuth();

      // Setup routing
      this.setupRouting();

      // Setup global event listeners
      this.setupGlobalEventListeners();

      // Initialize auth event listeners
      auth.setupEventListeners();

      this.isInitialized = true;
    } catch (error) {
      console.error("App initialization error:", error);
      showError("Failed to initialize application. Please refresh the page.");
    } finally {
      hideLoading();
    }
  }

  /**
   * Wait for authentication to initialize
   */
  async waitForAuth() {
    return new Promise((resolve) => {
      const checkAuth = () => {
        if (auth.isInitialized) {
          this.currentUser = auth.getCurrentUser();
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
  }

  /**
   * Setup application routing
   */
  setupRouting() {
    // Set up route hooks
    router.setBeforeRouteChange(this.handleBeforeRouteChange);
    router.setAfterRouteChange(this.handleAfterRouteChange);

    // Define routes
    router.addRoute("/", this.handleHomeRoute.bind(this), {
      authRequired: false,
    });

    router.addRoute("/login", this.handleLoginRoute.bind(this), {
      authRedirect: true,
    });

    router.addRoute("/register", this.handleRegisterRoute.bind(this), {
      authRedirect: true,
    });

    router.addRoute("/todos", this.handleTodosRoute.bind(this), {
      authRequired: true,
    });

    // Handle hash change events
    window.addEventListener("hashchange", this.handleRouteChange);
  }

  /**
   * Handle before route change
   * @param {string} path - Route path
   * @param {Object} route - Route object
   * @returns {boolean|Promise<boolean>} Whether to continue with route change
   */
  async handleBeforeRouteChange(path, route) {
    // Check authentication for protected routes
    if (route && route.authRequired && !auth.isAuthenticated()) {
      router.navigate("/login");
      return false;
    }

    // Redirect authenticated users away from auth pages
    if (route && route.authRedirect && auth.isAuthenticated()) {
      router.navigate("/todos");
      return false;
    }

    return true;
  }

  /**
   * Handle after route change
   * @param {string} path - Route path
   * @param {Object} route - Route object
   */
  handleAfterRouteChange(path, route) {
    // Update page title
    this.updatePageTitle(path);

    // Update navigation state
    this.updateNavigationState(path);

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Handle home route
   */
  handleHomeRoute() {
    // Redirect to appropriate page based on auth status
    if (auth.isAuthenticated()) {
      router.navigate("/todos");
    } else {
      router.navigate("/login");
    }
  }

  /**
   * Handle login route
   */
  handleLoginRoute() {
    router.showPage("login-page");
    this.focusFirstInput("login-form");
  }

  /**
   * Handle register route
   */
  handleRegisterRoute() {
    router.showPage("register-page");
    this.focusFirstInput("register-form");
  }

  /**
   * Handle todos route
   */
  async handleTodosRoute() {
    router.showPage("todos-page");

    // Load todos if not already loaded
    if (todoManager.getTodosCount() === 0) {
      await todoManager.loadTodos();
    }

    // Focus on todo input
    this.focusFirstInput("todo-form");
  }

  /**
   * Handle route change
   */
  handleRouteChange() {
    // This is handled by the router's internal route change handler
    // We can add additional logic here if needed
  }

  /**
   * Update page title based on current route
   * @param {string} path - Current route path
   */
  updatePageTitle(path) {
    const titles = {
      "/": "Todo App",
      "/login": "Login - Todo App",
      "/register": "Register - Todo App",
      "/todos": "My Todos - Todo App",
    };

    const title = titles[path] || "Todo App";
    document.title = title;
  }

  /**
   * Update navigation state
   * @param {string} path - Current route path
   */
  updateNavigationState(path) {
    // Update any navigation indicators
    // This could include updating active nav items, breadcrumbs, etc.
  }

  /**
   * Focus first input in a form
   * @param {string} formId - Form element ID
   */
  focusFirstInput(formId) {
    setTimeout(() => {
      const form = document.getElementById(formId);
      if (form) {
        const firstInput = form.querySelector("input, textarea, select");
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 100);
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEventListeners() {
    // Handle keyboard shortcuts
    document.addEventListener(
      "keydown",
      this.handleKeyboardShortcuts.bind(this)
    );

    // Handle window events
    window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Handle visibility change (tab focus/blur)
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardShortcuts(event) {
    // Only handle shortcuts when not in input fields
    if (
      event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA"
    ) {
      return;
    }

    // Ctrl/Cmd + K: Focus search (if implemented)
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      // Focus search input if available
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Escape: Close modals, clear errors
    if (event.key === "Escape") {
      hideError();
      hideSuccess();
    }
  }

  /**
   * Handle before unload
   * @param {BeforeUnloadEvent} event - Before unload event
   */
  handleBeforeUnload(event) {
    // Check if there are unsaved changes
    const hasUnsavedChanges = this.checkForUnsavedChanges();

    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue =
        "You have unsaved changes. Are you sure you want to leave?";
      return event.returnValue;
    }
  }

  /**
   * Check for unsaved changes
   * @returns {boolean} True if there are unsaved changes
   */
  checkForUnsavedChanges() {
    // Check if any forms have been modified
    const forms = document.querySelectorAll("form");
    for (const form of forms) {
      if (form.checkValidity && !form.checkValidity()) {
        return true;
      }
    }

    // Check if any todo is in edit mode
    const editingTodos = document.querySelectorAll(".todo-item.editing");
    if (editingTodos.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Handle online event
   */
  handleOnline() {
    showSuccess("Connection restored");

    // Retry any failed requests
    this.retryFailedRequests();
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    showError("You are offline. Some features may not work.");
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden - pause any timers, reduce activity
      this.pauseActivity();
    } else {
      // Page is visible - resume activity, refresh data if needed
      this.resumeActivity();
    }
  }

  /**
   * Pause application activity
   */
  pauseActivity() {
    // Pause any timers or intervals
    // This is a placeholder for future enhancements
  }

  /**
   * Resume application activity
   */
  resumeActivity() {
    // Resume timers, refresh data if stale
    if (auth.isAuthenticated() && router.getCurrentPath() === "/todos") {
      // Refresh todos if they're stale
      const lastRefresh = localStorage.getItem("lastTodosRefresh");
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (!lastRefresh || now - parseInt(lastRefresh) > fiveMinutes) {
        todoManager.loadTodos();
        localStorage.setItem("lastTodosRefresh", now.toString());
      }
    }
  }

  /**
   * Retry failed requests
   */
  retryFailedRequests() {
    // This could be implemented to retry failed API calls
    // For now, just refresh the current page data
    if (auth.isAuthenticated() && router.getCurrentPath() === "/todos") {
      todoManager.loadTodos();
    }
  }

  /**
   * Get application state
   * @returns {Object} Application state
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser,
      currentRoute: router.getCurrentPath(),
      todosCount: todoManager.getTodosCount(),
      isOnline: navigator.onLine,
    };
  }

  /**
   * Destroy the application
   */
  destroy() {
    // Clean up event listeners
    window.removeEventListener("hashchange", this.handleRouteChange);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    // Destroy router
    router.destroy();

    this.isInitialized = false;
  }
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create global app instance
  window.todoApp = new TodoApp();

  // Make app available globally for debugging
  if (typeof window !== "undefined") {
    window.app = window.todoApp;
  }
});

// Handle uncaught errors
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
  showError("An unexpected error occurred. Please refresh the page.");
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  showError("An unexpected error occurred. Please try again.");
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TodoApp };
}
