const mongoose = require("mongoose");

const horaireSchema = new mongoose.Schema({
  jour: String,
  ouverture: String,
  fermeture: String,
});

const commentaireSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: Number, required: true, min: 1, max: 5 },
  commentaire: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const salonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    ville: {
      type: String,
      required: true,
    },
    categorie: { 
      type: String, 
      enum: ['homme', 'femme', 'mixte'], 
      default: 'mixte' 
    },
    description: {
      type: String,
    },
    horaires: [horaireSchema], // ✅ Horaires d'ouverture
    prixMinimum: {
      type: Number,
      required: true,
      min: 0, // Prix minimum ne peut pas être négatif
    },
    commentaires: [commentaireSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Celui qui a créé le salon
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
