/**
 * Simple Hash-based Router for Todo Application
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeRouteChange = null;
    this.afterRouteChange = null;

    // Bind methods
    this.handleRouteChange = this.handleRouteChange.bind(this);

    // Initialize router
    this.init();
  }

  /**
   * Initialize the router
   */
  init() {
    // Listen for hash changes
    window.addEventListener("hashchange", this.handleRouteChange);

    // Handle initial route
    this.handleRouteChange();
  }

  /**
   * Add a route
   * @param {string} path - Route path (e.g., '/login', '/todos')
   * @param {Function} handler - Route handler function
   * @param {Object} options - Route options (auth required, etc.)
   */
  addRoute(path, handler, options = {}) {
    this.routes.set(path, {
      handler,
      ...options,
    });
  }

  /**
   * Remove a route
   * @param {string} path - Route path to remove
   */
  removeRoute(path) {
    this.routes.delete(path);
  }

  /**
   * Navigate to a route
   * @param {string} path - Route path
   * @param {Object} state - Optional state to pass to route
   */
  navigate(path, state = {}) {
    if (path.startsWith("/")) {
      path = path.substring(1);
    }

    window.location.hash = path;

    // Store state for the route
    if (Object.keys(state).length > 0) {
      this.routeState = state;
    }
  }

  /**
   * Get current route path
   * @returns {string} Current route path
   */
  getCurrentPath() {
    const hash = window.location.hash.substring(1);
    return hash || "/";
  }

  /**
   * Get current route
   * @returns {Object|null} Current route object
   */
  getCurrentRoute() {
    const path = this.getCurrentPath();
    return this.routes.get(path) || null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  }

  /**
   * Handle route changes
   */
  async handleRouteChange() {
    const path = this.getCurrentPath();
    const route = this.routes.get(path);

    // Call before route change hook
    if (this.beforeRouteChange) {
      const shouldContinue = await this.beforeRouteChange(path, route);
      if (shouldContinue === false) {
        return;
      }
    }

    // Hide all pages
    this.hideAllPages();

    if (route) {
      // Check authentication if required
      if (route.authRequired && !this.isAuthenticated()) {
        this.navigate("/login");
        return;
      }

      // Redirect authenticated users away from auth pages
      if (route.authRedirect && this.isAuthenticated()) {
        this.navigate("/todos");
        return;
      }

      try {
        // Call route handler
        await route.handler(this.routeState || {});
        this.currentRoute = path;

        // Clear route state
        this.routeState = null;

        // Call after route change hook
        if (this.afterRouteChange) {
          this.afterRouteChange(path, route);
        }
      } catch (error) {
        console.error("Route handler error:", error);
        this.handleRouteError(error, path);
      }
    } else {
      // Handle 404 - redirect to default route
      this.handleNotFound();
    }
  }

  /**
   * Hide all page elements
   */
  hideAllPages() {
    const pages = document.querySelectorAll(".page");
    pages.forEach((page) => {
      page.classList.add("hidden");
    });
  }

  /**
   * Show a specific page
   * @param {string} pageId - Page element ID
   */
  showPage(pageId) {
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.remove("hidden");
    }
  }

  /**
   * Handle route not found (404)
   */
  handleNotFound() {
    // Redirect to login if not authenticated, otherwise to todos
    if (this.isAuthenticated()) {
      this.navigate("/todos");
    } else {
      this.navigate("/login");
    }
  }

  /**
   * Handle route errors
   * @param {Error} error - Route error
   * @param {string} path - Route path that failed
   */
  handleRouteError(error, path) {
    console.error(`Route error for ${path}:`, error);

    // Show error message
    if (typeof showError === "function") {
      showError("An error occurred while loading the page. Please try again.");
    }

    // Redirect to safe route
    if (this.isAuthenticated()) {
      this.navigate("/todos");
    } else {
      this.navigate("/login");
    }
  }

  /**
   * Set before route change hook
   * @param {Function} hook - Hook function that returns boolean or Promise<boolean>
   */
  setBeforeRouteChange(hook) {
    this.beforeRouteChange = hook;
  }

  /**
   * Set after route change hook
   * @param {Function} hook - Hook function
   */
  setAfterRouteChange(hook) {
    this.afterRouteChange = hook;
  }

  /**
   * Get route parameters from hash
   * @param {string} path - Route path with parameters (e.g., '/todos/:id')
   * @returns {Object} Route parameters
   */
  getRouteParams(path) {
    const currentPath = this.getCurrentPath();
    const pathSegments = path.split("/");
    const currentSegments = currentPath.split("/");

    if (pathSegments.length !== currentSegments.length) {
      return {};
    }

    const params = {};
    for (let i = 0; i < pathSegments.length; i++) {
      if (pathSegments[i].startsWith(":")) {
        const paramName = pathSegments[i].substring(1);
        params[paramName] = currentSegments[i];
      }
    }

    return params;
  }

  /**
   * Check if current route matches pattern
   * @param {string} pattern - Route pattern (e.g., '/todos/:id')
   * @returns {boolean} True if route matches
   */
  matchesRoute(pattern) {
    const currentPath = this.getCurrentPath();
    const patternSegments = pattern.split("/");
    const currentSegments = currentPath.split("/");

    if (patternSegments.length !== currentSegments.length) {
      return false;
    }

    for (let i = 0; i < patternSegments.length; i++) {
      if (
        !patternSegments[i].startsWith(":") &&
        patternSegments[i] !== currentSegments[i]
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Destroy the router
   */
  destroy() {
    window.removeEventListener("hashchange", this.handleRouteChange);
    this.routes.clear();
    this.beforeRouteChange = null;
    this.afterRouteChange = null;
  }
}

// Create global router instance
const router = new Router();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Router, router };
}
