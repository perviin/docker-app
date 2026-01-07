const express = require("express");
const router = express.Router();
const User = require("../models/user");

/**
 * get /api/users
 * récupérer la liste de tous les utilisateurs
 */
router.get("/users", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const users = await User.getAll(limit);

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Erreur GET /users:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des utilisateurs",
      message: error.message,
    });
  }
});

/**
 * get /api/users/:id
 * récupérer un utilisateur par son id
 */
router.get("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    const user = await User.getById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Erreur GET /users/:id:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'utilisateur",
      message: error.message,
    });
  }
});

/**
 * post /api/users
 * créer un nouvel utilisateur
 */
router.post("/users", async (req, res) => {
  try {
    const { username, email } = req.body;

    // validation des données
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        error: "Le nom d'utilisateur et l'email sont requis",
      });
    }

    // validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Format d'email invalide",
      });
    }

    // validation du username
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        success: false,
        error: "Le nom d'utilisateur doit contenir entre 3 et 50 caractères",
      });
    }

    const user = await User.create(username, email);

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: user,
    });
  } catch (error) {
    console.error("Erreur POST /users:", error);

    // gestion des erreurs spécifiques
    if (error.message.includes("existe déjà")) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de l'utilisateur",
      message: error.message,
    });
  }
});

/**
 * put /api/users/:id
 * mettre à jour un utilisateur
 */
router.put("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { username, email } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    // vérifier qu'il y a au moins un champ à mettre à jour
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        error: "Aucun champ à mettre à jour",
      });
    }

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    const user = await User.update(id, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      data: user,
    });
  } catch (error) {
    console.error("Erreur PUT /users/:id:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de l'utilisateur",
      message: error.message,
    });
  }
});

/**
 * delete /api/users/:id
 * supprimer un utilisateur
 */
router.delete("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    const deleted = await User.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur DELETE /users/:id:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de l'utilisateur",
      message: error.message,
    });
  }
});

/**
 * get /api/users/stats/count
 * obtenir le nombre total d'utilisateurs
 */
router.get("/users/stats/count", async (req, res) => {
  try {
    const count = await User.count();

    res.json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Erreur GET /users/stats/count:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors du comptage des utilisateurs",
      message: error.message,
    });
  }
});

module.exports = router;
