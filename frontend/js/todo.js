/**
 * Todo Management module for Todo Application
 * Handles CRUD operations and todo state management
 */

class TodoManager {
  constructor() {
    this.todos = [];
    this.filter = 'all';
    this.isLoading = false;
    
    // Bind methods
    this.handleCreateTodo = this.handleCreateTodo.bind(this);
    this.handleToggleTodo = this.handleToggleTodo.bind(this);
    this.handleEditTodo = this.handleEditTodo.bind(this);
    this.handleDeleteTodo = this.handleDeleteTodo.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    
    // Initialize
    this.init();
  }

  /**
   * Initialize todo manager
   */
  async init() {
    await this.loadTodos();
    this.setupEventListeners();
  }

  /**
   * Load todos from API
   */
  async loadTodos() {
    try {
      this.setLoading(true);
      const todos = await api.getTodos();
      this.todos = todos;
      this.renderTodos();
      this.updateStats();
    } catch (error) {
      console.error('Error loading todos:', error);
      showError('Failed to load todos. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle create todo form submission
   * @param {Event} event - Form submit event
   */
  async handleCreateTodo(event) {
    event.preventDefault();
    
    const form = event.target;
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const addBtn = document.getElementById('add-todo-btn');
    
    // Clear previous errors
    this.clearFormErrors();
    
    // Validate form
    if (!this.validateTodoForm(title, description)) {
      return;
    }
    
    try {
      setButtonLoading(addBtn, true);
      
      const newTodo = await api.createTodo(title, description);
      
      // Add to local state
      this.todos.unshift(newTodo);
      this.renderTodos();
      this.updateStats();
      
      // Clear form
      form.reset();
      
      // Show success message
      showSuccess('Todo created successfully!');
      
    } catch (error) {
      console.error('Error creating todo:', error);
      this.handleTodoError(error, 'create');
    } finally {
      setButtonLoading(addBtn, false);
    }
  }

  /**
   * Handle todo toggle (complete/incomplete)
   * @param {Event} event - Checkbox change event
   */
  async handleToggleTodo(event) {
    const todoId = parseInt(event.target.dataset.todoId);
    const completed = event.target.checked;
    
    try {
      // Optimistic update
      const todo = this.todos.find(t => t.id === todoId);
      if (todo) {
        todo.completed = completed;
        this.renderTodos();
        this.updateStats();
      }
      
      // Update on server
      await api.toggleTodo(todoId, completed);
      
    } catch (error) {
      console.error('Error toggling todo:', error);
      
      // Revert optimistic update
      const todo = this.todos.find(t => t.id === todoId);
      if (todo) {
        todo.completed = !completed;
        this.renderTodos();
        this.updateStats();
      }
      
      showError('Failed to update todo. Please try again.');
    }
  }

  /**
   * Handle todo edit
   * @param {Event} event - Edit button click event
   */
  handleEditTodo(event) {
    const todoId = parseInt(event.target.dataset.todoId);
    const todo = this.todos.find(t => t.id === todoId);
    
    if (!todo) return;
    
    // Find todo item element
    const todoItem = event.target.closest('.todo-item');
    if (!todoItem) return;
    
    // Enter edit mode
    todoItem.classList.add('editing');
    
    // Create edit form
    const editForm = this.createEditForm(todo);
    const editFormContainer = todoItem.querySelector('.todo-edit-form');
    if (editFormContainer) {
      editFormContainer.innerHTML = '';
      editFormContainer.appendChild(editForm);
    }
    
    // Focus on title input
    const titleInput = editForm.querySelector('input[name="title"]');
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }
  }

  /**
   * Handle todo save (after edit)
   * @param {Event} event - Form submit event
   */
  async handleSaveTodo(event) {
    event.preventDefault();
    
    const form = event.target;
    const todoId = parseInt(form.dataset.todoId);
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    
    // Validate form
    if (!this.validateTodoForm(title, description)) {
      return;
    }
    
    try {
      // Update on server
      const updatedTodo = await api.updateTodo(todoId, { title, description });
      
      // Update local state
      const index = this.todos.findIndex(t => t.id === todoId);
      if (index !== -1) {
        this.todos[index] = updatedTodo;
        this.renderTodos();
      }
      
      showSuccess('Todo updated successfully!');
      
    } catch (error) {
      console.error('Error updating todo:', error);
      showError('Failed to update todo. Please try again.');
    }
  }

  /**
   * Handle todo cancel edit
   * @param {Event} event - Cancel button click event
   */
  handleCancelEdit(event) {
    const todoItem = event.target.closest('.todo-item');
    if (todoItem) {
      todoItem.classList.remove('editing');
    }
  }

  /**
   * Handle todo deletion
   * @param {Event} event - Delete button click event
   */
  async handleDeleteTodo(event) {
    const todoId = parseInt(event.target.dataset.todoId);
    const todo = this.todos.find(t => t.id === todoId);
    
    if (!todo) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      return;
    }
    
    try {
      // Optimistic update
      this.todos = this.todos.filter(t => t.id !== todoId);
      this.renderTodos();
      this.updateStats();
      
      // Delete on server
      await api.deleteTodo(todoId);
      
      showSuccess('Todo deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting todo:', error);
      
      // Revert optimistic update
      this.todos.push(todo);
      this.todos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      this.renderTodos();
      this.updateStats();
      
      showError('Failed to delete todo. Please try again.');
    }
  }

  /**
   * Handle filter change
   * @param {Event} event - Filter button click event
   */
  handleFilterChange(event) {
    const filter = event.target.dataset.filter;
    this.setFilter(filter);
  }

  /**
   * Set current filter
   * @param {string} filter - Filter type ('all', 'pending', 'completed')
   */
  setFilter(filter) {
    this.filter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    this.renderTodos();
  }

  /**
   * Validate todo form
   * @param {string} title - Todo title
   * @param {string} description - Todo description
   * @returns {boolean} True if valid
   */
  validateTodoForm(title, description) {
    let isValid = true;
    
    // Validate title
    if (!title) {
      this.showFieldError('todo-title-error', 'Title is required');
      isValid = false;
    } else if (title.length > 100) {
      this.showFieldError('todo-title-error', 'Title must be less than 100 characters');
      isValid = false;
    }
    
    // Validate description
    if (description && description.length > 500) {
      this.showFieldError('todo-description-error', 'Description must be less than 500 characters');
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
   */
  clearFormErrors() {
    const errorElements = document.querySelectorAll('#todo-form .field-error');
    errorElements.forEach(element => {
      element.textContent = '';
    });
  }

  /**
   * Handle todo errors
   * @param {Error} error - Todo error
   * @param {string} operation - Operation type
   */
  handleTodoError(error, operation) {
    if (error.isValidationError) {
      if (error.data && error.data.errors) {
        Object.keys(error.data.errors).forEach(field => {
          const errorId = `todo-${field}-error`;
          this.showFieldError(errorId, error.data.errors[field]);
        });
      } else {
        showError(error.message || 'Please check your input and try again.');
      }
    } else if (error.isNetworkError) {
      showError('Network error. Please check your connection and try again.');
    } else {
      showError(`Failed to ${operation} todo. Please try again.`);
    }
  }

  /**
   * Create edit form for todo
   * @param {Object} todo - Todo object
   * @returns {HTMLElement} Edit form element
   */
  createEditForm(todo) {
    const form = document.createElement('form');
    form.className = 'todo-edit-form';
    form.dataset.todoId = todo.id;
    
    form.innerHTML = `
      <div class="form-group">
        <input type="text" name="title" value="${escapeHtml(todo.title)}" required maxlength="100">
        <div class="field-error" id="edit-title-error"></div>
      </div>
      <div class="form-group">
        <textarea name="description" maxlength="500">${escapeHtml(todo.description || '')}</textarea>
        <div class="field-error" id="edit-description-error"></div>
      </div>
      <div class="todo-edit-actions">
        <button type="submit" class="btn btn-primary btn-sm">Save</button>
        <button type="button" class="btn btn-outline btn-sm cancel-edit">Cancel</button>
      </div>
    `;
    
    // Add event listeners
    form.addEventListener('submit', this.handleSaveTodo.bind(this));
    form.querySelector('.cancel-edit').addEventListener('click', this.handleCancelEdit.bind(this));
    
    return form;
  }

  /**
   * Render todos list
   */
  renderTodos() {
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!todoList) return;
    
    // Filter todos
    const filteredTodos = this.getFilteredTodos();
    
    if (filteredTodos.length === 0) {
      todoList.innerHTML = '';
      if (emptyState) {
        emptyState.classList.remove('hidden');
      }
      return;
    }
    
    if (emptyState) {
      emptyState.classList.add('hidden');
    }
    
    // Render todos
    todoList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');
    
    // Add event listeners to todo elements
    this.attachTodoEventListeners();
  }

  /**
   * Get filtered todos based on current filter
   * @returns {Array} Filtered todos
   */
  getFilteredTodos() {
    switch (this.filter) {
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      case 'pending':
        return this.todos.filter(todo => !todo.completed);
      default:
        return this.todos;
    }
  }

  /**
   * Create todo element HTML
   * @param {Object} todo - Todo object
   * @returns {string} Todo element HTML
   */
  createTodoElement(todo) {
    const createdDate = formatDate(todo.created_at);
    const completedClass = todo.completed ? 'completed' : '';
    
    return `
      <div class="todo-item ${completedClass}" data-todo-id="${todo.id}">
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-todo-id="${todo.id}"></div>
        <div class="todo-content">
          <div class="todo-title-text">${escapeHtml(todo.title)}</div>
          ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
          <div class="todo-meta">
            <span class="todo-date">Created ${createdDate}</span>
          </div>
        </div>
        <div class="todo-edit-form"></div>
        <div class="todo-actions">
          <button class="btn btn-outline btn-sm edit-todo" data-todo-id="${todo.id}" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn btn-danger btn-sm delete-todo" data-todo-id="${todo.id}" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to todo elements
   */
  attachTodoEventListeners() {
    // Toggle checkboxes
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', this.handleToggleTodo);
    });
    
    // Edit buttons
    document.querySelectorAll('.edit-todo').forEach(btn => {
      btn.addEventListener('click', this.handleEditTodo);
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-todo').forEach(btn => {
      btn.addEventListener('click', this.handleDeleteTodo);
    });
  }

  /**
   * Update todo statistics
   */
  updateStats() {
    const totalTodos = this.todos.length;
    const completedTodos = this.todos.filter(todo => todo.completed).length;
    const pendingTodos = totalTodos - completedTodos;
    
    const todoCountElement = document.getElementById('todo-count');
    if (todoCountElement) {
      let countText = '';
      switch (this.filter) {
        case 'completed':
          countText = `${completedTodos} completed todo${completedTodos !== 1 ? 's' : ''}`;
          break;
        case 'pending':
          countText = `${pendingTodos} pending todo${pendingTodos !== 1 ? 's' : ''}`;
          break;
        default:
          countText = `${totalTodos} todo${totalTodos !== 1 ? 's' : ''}`;
      }
      todoCountElement.textContent = countText;
    }
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading(loading) {
    this.isLoading = loading;
    const todoList = document.getElementById('todo-list');
    if (todoList) {
      if (loading) {
        todoList.classList.add('loading');
      } else {
        todoList.classList.remove('loading');
      }
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Todo form
    const todoForm = document.getElementById('todo-form');
    if (todoForm) {
      todoForm.addEventListener('submit', this.handleCreateTodo);
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', this.handleFilterChange);
    });
    
    // Clear form errors when user starts typing
    const titleInput = document.getElementById('todo-title');
    const descriptionInput = document.getElementById('todo-description');
    
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        this.clearFieldError('todo-title-error');
      });
    }
    
    if (descriptionInput) {
      descriptionInput.addEventListener('input', () => {
        this.clearFieldError('todo-description-error');
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
      errorElement.textContent = '';
    }
  }

  /**
   * Get todos count
   * @returns {number} Total todos count
   */
  getTodosCount() {
    return this.todos.length;
  }

  /**
   * Get completed todos count
   * @returns {number} Completed todos count
   */
  getCompletedCount() {
    return this.todos.filter(todo => todo.completed).length;
  }

  /**
   * Get pending todos count
   * @returns {number} Pending todos count
   */
  getPendingCount() {
    return this.todos.filter(todo => !todo.completed).length;
  }
}

// Create global todo manager instance
const todoManager = new TodoManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TodoManager, todoManager };
}
