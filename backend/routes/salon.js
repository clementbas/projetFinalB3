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
    const {
      name,
      address,
      ville,
      categorie,
      description,
      prixMinimum,
      horaires
    } = req.body;

    try {
      const salon = new Salon({
        name,
        address,
        ville,
        categorie,
        description,
        prixMinimum,
        horaires,
        owner: req.user.id,
      });

      await salon.save();
      res.status(201).json(salon);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  }
);


// 🔄 Modifier un salon
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const salonId = req.params.id;
    const user = req.user;

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    // Vérifie si l'utilisateur est le créateur ou un admin
    const isOwner = salon.owner.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Accès interdit : non autorisé à modifier ce salon' });
    }

    // ✅ Champs modifiables
    const {
      name,
      address,
      ville,
      description,
      categorie,
      prixMinimum,
      horaires
    } = req.body;

    if (name !== undefined) salon.name = name;
    if (address !== undefined) salon.address = address;
    if (ville !== undefined) salon.ville = ville;
    if (description !== undefined) salon.description = description;
    if (categorie !== undefined) salon.categorie = categorie;
    if (prixMinimum !== undefined) salon.prixMinimum = prixMinimum;
    if (horaires !== undefined) salon.horaires = horaires;

    await salon.save();
    res.status(200).json({ message: 'Salon mis à jour avec succès', salon });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


// 🗑️ Supprimer un salon
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    const isOwner = salon.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Accès interdit : vous ne pouvez pas supprimer ce salon' });
    }

    await salon.deleteOne();
    res.status(200).json({ message: 'Salon supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


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

// 💬 Ajouter un commentaire à un salon
router.post('/:id/commentaire', authMiddleware, async (req, res) => {
  try {
    const salonId = req.params.id;
    const userId = req.user.id;
    const { note, commentaire } = req.body;

    // Vérifications côté serveur
    if (!note || !commentaire) {
      return res.status(400).json({ message: "Note et commentaire sont obligatoires." });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({ message: "La note doit être comprise entre 1 et 5." });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: "Salon non trouvé." });
    }

    // Vérifie si l'utilisateur a déjà commenté
    const dejaCommente = salon.commentaires.some(c => c.utilisateur.toString() === userId);
    if (dejaCommente) {
      return res.status(400).json({ message: "Vous avez déjà laissé un commentaire pour ce salon." });
    }

    const nouveauCommentaire = {
      utilisateur: userId,
      note,
      commentaire
    };

    salon.commentaires.push(nouveauCommentaire);
    await salon.save();

    res.status(201).json({ message: "Commentaire ajouté avec succès.", commentaire: nouveauCommentaire });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


module.exports = router;
