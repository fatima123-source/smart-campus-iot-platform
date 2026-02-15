import Event from "../models/Event.js";

// créer
export const createEvent = async (req, res) => {
  try {
    const {
      type,
      salleId,
      capteurType,
      valeur,
      capacite,
      description
    } = req.body;

    const event = new Event({
      type,
      salleId,
      capteurType,
      valeur,
      capacite,
      description
    });

    await event.save();

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// tous events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// events par salle
export const getEventsBySalle = async (req, res) => {
  try {
    const events = await Event.find({
      salleId: req.params.salleId
    }).sort({ timestamp: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ récupérer le dernier événement par salle
export const getLastEventBySalle = async (req, res) => {
  try {
    const lastEvent = await Event.findOne({
      salleId: req.query.salleId
    })
    .sort({ timestamp: -1 }); // 🔹 tri décroissant, donc le premier est le plus récent

    if (!lastEvent) {
      return res.status(404).json({ message: "Aucun événement trouvé pour cette salle" });
    }

    res.json(lastEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
