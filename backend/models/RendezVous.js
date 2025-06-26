const mongoose = require("mongoose");

const RendezVousSchema = new mongoose.Schema({
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  statut: {
    type: String,
    enum: ["en attente", "confirmé", "annulé"],
    default: "en attente",
  },
  commentaire: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("RendezVous", RendezVousSchema);
