/**
 * Utility functions for the Todo Application
 */

/**
 * Show error message to user
 * @param {string} message - Error message
 * @param {number} duration - Display duration in ms (default: 5000)
 */
function showError(message, duration = 5000) {
  const errorContainer = document.getElementById("error-container");
  const errorText = document.getElementById("error-text");

  if (!errorContainer || !errorText) return;

  errorText.textContent = message;
  errorContainer.classList.remove("hidden");

  // Auto-hide after duration
  setTimeout(() => {
    hideError();
  }, duration);
}

/**
 * Hide error message
 */
function hideError() {
  const errorContainer = document.getElementById("error-container");
  if (errorContainer) {
    errorContainer.classList.add("hidden");
  }
}

/**
 * Show success message to user
 * @param {string} message - Success message
 * @param {number} duration - Display duration in ms (default: 3000)
 */
function showSuccess(message, duration = 3000) {
  const successContainer = document.getElementById("success-container");
  const successText = document.getElementById("success-text");

  if (!successContainer || !successText) return;

  successText.textContent = message;
  successContainer.classList.remove("hidden");

  // Auto-hide after duration
  setTimeout(() => {
    hideSuccess();
  }, duration);
}

/**
 * Hide success message
 */
function hideSuccess() {
  const successContainer = document.getElementById("success-container");
  if (successContainer) {
    successContainer.classList.add("hidden");
  }
}

/**
 * Show loading screen
 */
function showLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.remove("hidden");
  }
}

/**
 * Hide loading screen
 */
function hideLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
  }
}

/**
 * Set button loading state
 * @param {HTMLElement} button - Button element
 * @param {boolean} loading - Loading state
 */
function setButtonLoading(button, loading) {
  if (!button) return;

  const btnText = button.querySelector(".btn-text");
  const btnSpinner = button.querySelector(".btn-spinner");

  if (loading) {
    button.disabled = true;
    if (btnText) btnText.classList.add("hidden");
    if (btnSpinner) btnSpinner.classList.remove("hidden");
  } else {
    button.disabled = false;
    if (btnText) btnText.classList.remove("hidden");
    if (btnSpinner) btnSpinner.classList.add("hidden");
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
function validatePassword(password) {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateUsername(username) {
  if (username.length < 3) {
    return {
      isValid: false,
      message: "Username must be at least 3 characters long",
    };
  }
  if (username.length > 20) {
    return {
      isValid: false,
      message: "Username must be less than 20 characters",
    };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: "Username can only contain letters, numbers, and underscores",
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - d);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString();
  }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 * @param {HTMLElement|string} element - Element or selector
 * @param {number} offset - Offset from top
 */
function smoothScrollTo(element, offset = 0) {
  const target =
    typeof element === "string" ? document.querySelector(element) : element;
  if (!target) return;

  const targetPosition = target.offsetTop - offset;
  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Get query parameter value
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Set query parameter
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 */
function setQueryParam(name, value) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);
  window.history.replaceState({}, "", url);
}

/**
 * Remove query parameter
 * @param {string} name - Parameter name
 */
function removeQueryParam(name) {
  const url = new URL(window.location);
  url.searchParams.delete(name);
  window.history.replaceState({}, "", url);
}

/**
 * Local storage helpers with error handling
 */
const storage = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn("Error reading from localStorage:", error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Error writing to localStorage:", error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn("Error removing from localStorage:", error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   * @returns {boolean} Success status
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn("Error clearing localStorage:", error);
      return false;
    }
  },
};

// Export functions for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    showError,
    hideError,
    showSuccess,
    hideSuccess,
    showLoading,
    hideLoading,
    setButtonLoading,
    isValidEmail,
    validatePassword,
    validateUsername,
    formatDate,
    debounce,
    throttle,
    escapeHtml,
    generateId,
    deepClone,
    isInViewport,
    smoothScrollTo,
    copyToClipboard,
    getQueryParam,
    setQueryParam,
    removeQueryParam,
    storage,
  };
}
