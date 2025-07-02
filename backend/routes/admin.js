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

// Modifier les informations d'un utilisateur
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const requestingUser = req.user;

    // Vérifier si l'utilisateur est admin
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const userId = req.params.id;
    const { nom, prenom, email, role } = req.body;

    // Vérifier si les champs sont valides
    if (!nom && !prenom && !email && !role) {
      return res.status(400).json({ message: 'Aucune information à mettre à jour' });
    }

    const validRoles = ['user', 'coiffeur', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nom, prenom, email, role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      message: 'Informations utilisateur mises à jour avec succès',
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

// Ajouter une route pour récupérer un utilisateur par son ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const requestingUser = req.user;

    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const userId = req.params.id;
    const user = await User.findById(userId, '-motDePasse'); // Exclure le mot de passe

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Supprimer un utilisateur
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const requestingUser = req.user;

    // Vérifier si l'utilisateur est admin
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'utilisateur
    await user.deleteOne();

    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
