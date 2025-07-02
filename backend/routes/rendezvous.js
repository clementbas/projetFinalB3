const express = require("express");
const router = express.Router();
const RendezVous = require("../models/RendezVous");
const Salon = require("../models/Salon");
const authMiddleware = require("../middlewares/authMiddleware");

// POST /rendezvous/:salonId
router.post("/:salonId", authMiddleware, async (req, res) => {
  try {
    const { salonId } = req.params;
    const { date, commentaire } = req.body;

    // Vérifier que le salon existe
    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ message: "Salon non trouvé" });

    // Vérifier que la date est valide et future
    const dateObj = new Date(date);
    if (isNaN(dateObj) || dateObj < new Date()) {
      return res.status(400).json({ message: "Date invalide ou passée" });
    }

    // Vérifier qu'il n'y a pas déjà un rdv à ce moment dans ce salon
    const rdvExiste = await RendezVous.findOne({ salon: salonId, date: dateObj });
    if (rdvExiste) {
      return res.status(409).json({ message: "Créneau déjà réservé" });
    }

    const nouveauRdv = new RendezVous({
      salon: salonId,
      client: req.user.id,
      date: dateObj,
      commentaire,
    });

    await nouveauRdv.save();
    res.status(201).json({ message: "Rendez-vous réservé avec succès", rendezVous: nouveauRdv });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.get("/salon/:salonId", authMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.salonId);
    if (!salon) return res.status(404).json({ message: "Salon non trouvé" });

    // Seul l’admin ou le propriétaire peut voir les rdv du salon
    if (
      salon.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const rdvs = await RendezVous.find({ salon: salon._id }).populate("client", "nom email");
    res.json(rdvs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.get("/mes", authMiddleware, async (req, res) => {
  try {
    const rdvs = await RendezVous.find({ client: req.user.id }).populate("salon", "name ville");
    res.json(rdvs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const rdv = await RendezVous.findById(req.params.id);
      if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });

      const salon = await Salon.findById(rdv.salon);
      const isAdmin = req.user.role === "admin";
      const isOwner = salon.owner.toString() === req.user.id;
      const isClient = rdv.client.toString() === req.user.id;

      if (!isAdmin && !isOwner && !isClient) {
        return res.status(403).json({ message: "Non autorisé à annuler ce rendez-vous" });
      }

      await rdv.deleteOne();
      res.json({ message: "Rendez-vous annulé avec succès" });
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  });


module.exports = router;
