const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const RendezVous = require("../models/RendezVous");

// Seuls les admins peuvent changer le rôle d’un utilisateur
router.put('/:id/role', authMiddleware, async (req, res) => {
  try {
    const requestingUser = req.user;

    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const userId = req.params.id;
    const { role } = req.body;

    const validRoles = ['user', 'coiffeur', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      message: `Rôle mis à jour avec succès`,
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Ajouter une route pour récupérer tous les utilisateurs
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const requestingUser = req.user;

    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const users = await User.find({}, '-motDePasse'); // Exclure le mot de passe
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/rendezvous
router.get("/rdv", authMiddleware, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }

    // Récupérer tous les rendez-vous avec info client + salon
    const rdvs = await RendezVous.find()
      .populate("client", "nom prenom email")
      .populate("salon", "name ville adress");

    res.json(rdvs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});


module.exports = router;
