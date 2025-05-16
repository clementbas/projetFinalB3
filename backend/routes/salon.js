const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const Salon = require("../models/Salon");

// 📥 Créer un salon — seulement admin ou coiffeur
router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "coiffeur"),
  async (req, res) => {
    const { name, address, description } = req.body;

    try {
      const salon = new Salon({
        name,
        address,
        description,
        owner: req.user.id,
      });

      await salon.save();
      res.status(201).json(salon);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  }
);

// 📋 Voir tous les salons — uniquement connecté
router.get("/", authMiddleware, async (req, res) => {
  try {
    const salons = await Salon.find().populate("owner", "email role");
    res.json(salons);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// 🔍 Voir un salon par ID - uniquement connecté
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id).populate("owner", "email role");
    if (!salon) return res.status(404).json({ message: "Salon non trouvé" });
    res.json(salon);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
