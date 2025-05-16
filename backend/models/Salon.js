const mongoose = require("mongoose");

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
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Celui qui a créé le salon
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
