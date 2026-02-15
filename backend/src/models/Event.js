const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['salle_vide', 'salle_pleine', 'surconsommation', 'temperature_elevee', 'temperature_basse'],
    required: true
  },
  salleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Salle'
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  message: {
    type: String
  },
  traite: {
    type: Boolean,
    default: false
  },
  capteurType: {
    type: String
  },
  valeur: {
    type: Number
  },
  seuil: {
    type: Number
  }
});

module.exports = mongoose.model('Event', eventSchema);

