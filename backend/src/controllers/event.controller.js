const Event = require('../models/Event');

// Créer un événement
exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ message: 'Événement créé', event: newEvent });
  } catch (error) {
    res.status(400).json({ message: 'Erreur création événement', error });
  }
};

// Récupérer tous les événements
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ message: 'Erreur récupération événements', error });
  }
};
