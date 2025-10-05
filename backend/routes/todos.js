const express = require('express');
const Todo = require('../models/Todo');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateTodoCreation, 
  validateTodoUpdate, 
  validateTodoQuery 
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/todos - Get all todos for authenticated user
router.get('/', validateTodoQuery, async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const userId = req.user.id;

    // Get todos
    const todos = await Todo.findByUserId(userId, { status, limit, offset });
    
    // Get total count for pagination
    const totalCount = await Todo.getCountByUserId(userId, status);

    res.json({
      success: true,
      message: 'Todos retrieved successfully',
      data: {
        todos: todos.map(todo => todo.toJSON()),
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving todos',
      code: 'GET_TODOS_ERROR'
    });
  }
});

// POST /api/todos - Create a new todo
router.post('/', validateTodoCreation, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    const todo = await Todo.create({
      user_id: userId,
      title,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: {
        todo: todo.toJSON()
      }
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating todo',
      code: 'CREATE_TODO_ERROR'
    });
  }
});

// GET /api/todos/:id - Get a specific todo by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
        code: 'TODO_NOT_FOUND'
      });
    }

    // Check if todo belongs to user
    if (!(await todo.belongsToUser(userId))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This todo does not belong to you',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({
      success: true,
      message: 'Todo retrieved successfully',
      data: {
        todo: todo.toJSON()
      }
    });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving todo',
      code: 'GET_TODO_ERROR'
    });
  }
});

// PUT /api/todos/:id - Update a specific todo
router.put('/:id', validateTodoUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
        code: 'TODO_NOT_FOUND'
      });
    }

    // Check if todo belongs to user
    if (!(await todo.belongsToUser(userId))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This todo does not belong to you',
        code: 'ACCESS_DENIED'
      });
    }

    // Update todo
    const updatedTodo = await todo.update(updateData);

    res.json({
      success: true,
      message: 'Todo updated successfully',
      data: {
        todo: updatedTodo.toJSON()
      }
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating todo',
      code: 'UPDATE_TODO_ERROR'
    });
  }
});

// DELETE /api/todos/:id - Delete a specific todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
        code: 'TODO_NOT_FOUND'
      });
    }

    // Check if todo belongs to user
    if (!(await todo.belongsToUser(userId))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This todo does not belong to you',
        code: 'ACCESS_DENIED'
      });
    }

    // Delete todo
    await todo.delete();

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting todo',
      code: 'DELETE_TODO_ERROR'
    });
  }
});

module.exports = router;
