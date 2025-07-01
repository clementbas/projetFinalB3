const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const Salon = require("../models/Salon");
const User = require("../models/User");

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
      horaires,
      owner
    } = req.body;

    try {
      let ownerId = req.user.id;

      if (req.user.role === "admin" && owner) {
        // Admin a fourni un owner
        const { nom, prenom, email } = owner;

        if (!nom || !prenom || !email) {
          return res.status(400).json({ message: "Nom, prénom et email du owner sont requis." });
        }

        // Vérifie si l'utilisateur existe
        let user = await User.findOne({ email });

        if (!user) {
          // Génère un mot de passe temporaire (ou laisse vide si tu utilises un système d’invitation)
          const randomPassword = Math.random().toString(36).slice(-8);

          user = new User({
            nom,
            prenom,
            email,
            password: randomPassword,
            role: "coiffeur"
          });

          await user.save();
        }

        ownerId = user._id;
      }

      const salon = new Salon({
        name,
        address,
        ville,
        categorie,
        description,
        prixMinimum,
        horaires,
        owner: ownerId,
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

    const isOwner = salon.owner.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Accès interdit : non autorisé à modifier ce salon' });
    }

    const {
      name,
      address,
      ville,
      description,
      categorie,
      prixMinimum,
      horaires,
      owner
    } = req.body;

    // ✅ Mise à jour des champs classiques
    if (name !== undefined) salon.name = name;
    if (address !== undefined) salon.address = address;
    if (ville !== undefined) salon.ville = ville;
    if (description !== undefined) salon.description = description;
    if (categorie !== undefined) salon.categorie = categorie;
    if (prixMinimum !== undefined) salon.prixMinimum = prixMinimum;
    if (horaires !== undefined) salon.horaires = horaires;

    // ✅ Si admin et owner fourni : vérifie qu'il existe et est coiffeur
    if (owner && isAdmin) {
      const { email } = owner;

      if (!email) {
        return res.status(400).json({ message: "L'email du propriétaire est requis." });
      }

      const ownerUser = await User.findOne({ email });

      if (!ownerUser) {
        return res.status(404).json({ message: "Utilisateur owner non trouvé." });
      }

      if (ownerUser.role !== 'coiffeur') {
        return res.status(400).json({ message: "Le propriétaire doit être un utilisateur avec le rôle 'coiffeur'." });
      }

      salon.owner = ownerUser._id;
    }

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
