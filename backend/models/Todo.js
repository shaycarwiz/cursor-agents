const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');

class Todo {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description || null;
    this.completed = data.completed || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new todo
  static async create(todoData) {
    const todo = new Todo(todoData);

    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const sql = `
        INSERT INTO todos (id, user_id, title, description, completed)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [todo.id, todo.user_id, todo.title, todo.description, todo.completed], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(todo);
        }
      });
    });
  }

  // Find todo by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const sql = 'SELECT * FROM todos WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? new Todo(row) : null);
        }
      });
    });
  }

  // Find all todos for a user
  static async findByUserId(userId, options = {}) {
    const { status = 'all', limit = 50, offset = 0 } = options;
    
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      let sql = 'SELECT * FROM todos WHERE user_id = ?';
      const params = [userId];

      // Add status filter
      if (status === 'completed') {
        sql += ' AND completed = 1';
      } else if (status === 'pending') {
        sql += ' AND completed = 0';
      }

      // Add ordering and pagination
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const todos = rows.map(row => new Todo(row));
          resolve(todos);
        }
      });
    });
  }

  // Update todo
  async update(updateData) {
    const allowedFields = ['title', 'description', 'completed'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return this;
    }

    values.push(this.id);

    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const sql = `
        UPDATE todos 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, values, (err) => {
        if (err) {
          reject(err);
        } else {
          // Update the instance
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // Delete todo
  async delete() {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const sql = 'DELETE FROM todos WHERE id = ?';
      
      db.run(sql, [this.id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Get todo count for user
  static async getCountByUserId(userId, status = 'all') {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      let sql = 'SELECT COUNT(*) as count FROM todos WHERE user_id = ?';
      const params = [userId];

      if (status === 'completed') {
        sql += ' AND completed = 1';
      } else if (status === 'pending') {
        sql += ' AND completed = 0';
      }

      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  // Check if todo belongs to user
  async belongsToUser(userId) {
    return this.user_id === userId;
  }

  // Get todo data as JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      description: this.description,
      completed: Boolean(this.completed),
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Todo;
