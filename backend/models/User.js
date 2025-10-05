const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const database = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, password } = userData;
    
    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const user = new User({
      username,
      email,
      password_hash
    });

    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const sql = `
        INSERT INTO users (id, username, email, password_hash)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(sql, [user.id, user.username, user.email, user.password_hash], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  // Find user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const sql = 'SELECT * FROM users WHERE email = ?';
      
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? new User(row) : null);
        }
      });
    });
  }

  // Find user by username
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const sql = 'SELECT * FROM users WHERE username = ?';
      
      db.get(sql, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? new User(row) : null);
        }
      });
    });
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const sql = 'SELECT * FROM users WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? new User(row) : null);
        }
      });
    });
  }

  // Verify password
  async verifyPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  // Get user data without sensitive information
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Check if email exists
  static async emailExists(email) {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  // Check if username exists
  static async usernameExists(username) {
    const user = await this.findByUsername(username);
    return user !== null;
  }
}

module.exports = User;
