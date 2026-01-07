const pool = require("../config/database");

class User {
  /**
   * récupérer tous les utilisateurs
   * @param {number} limit - Nombre maximum d'utilisateurs à récupérer
   * @returns {Promise<Array>}
   */
  static async getAll(limit = 100) {
    try {
      const query =
        "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT $1";
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  }

  /**
   * récupérer un utilisateur par id
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Object|null>}
   */
  static async getById(id) {
    try {
      const query =
        "SELECT id, username, email, created_at FROM users WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * récupérer un utilisateur par email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object|null>}
   */
  static async getByEmail(email) {
    try {
      const query =
        "SELECT id, username, email, created_at FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * créer un nouvel utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>}
   */
  static async create(username, email) {
    try {
      const query = `
        INSERT INTO users (username, email) 
        VALUES ($1, $2) 
        RETURNING id, username, email, created_at
      `;
      const result = await pool.query(query, [username, email]);
      return result.rows[0];
    } catch (error) {
      // gestion des erreurs de contrainte unique
      if (error.code === "23505") {
        if (error.constraint === "users_username_key") {
          throw new Error("Ce nom d'utilisateur existe déjà");
        }
        if (error.constraint === "users_email_key") {
          throw new Error("Cet email existe déjà");
        }
      }
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * mettre à jour un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @param {Object} updates - Champs à mettre à jour
   * @returns {Promise<Object|null>}
   */
  static async update(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // construire dynamiquement la requête de mise à jour
      if (updates.username !== undefined) {
        fields.push(`username = $${paramCount++}`);
        values.push(updates.username);
      }
      if (updates.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(updates.email);
      }

      if (fields.length === 0) {
        throw new Error("Aucun champ à mettre à jour");
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${paramCount} 
        RETURNING id, username, email, created_at, updated_at
      `;

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * supprimer un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      const query = "DELETE FROM users WHERE id = $1 RETURNING id";
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * compter le nombre total d'utilisateurs
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const query = "SELECT COUNT(*) as count FROM users";
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Erreur lors du comptage des utilisateurs:", error);
      throw error;
    }
  }
}

module.exports = User;
