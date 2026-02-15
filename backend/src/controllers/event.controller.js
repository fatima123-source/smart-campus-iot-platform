const Event = require("../models/Event");
const { checkRule } = require("../services/rule.service");
const { sendNotification } = require("../services/notification.service");

exports.createEvent = async (req, res) => {
  try {
    const { nomEvent, sensorId, typeEvent, valeur, seuil } = req.body;

    const statut = checkRule(valeur, seuil);

    const event = new Event({
      nomEvent,
      sensorId,
      typeEvent,
      valeur,
      seuil,
      statut
    });

    await event.save();

    if (statut === "detecte") {
      await sendNotification(event);
    }

    res.status(201).json(event);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  const events = await Event.find().populate("sensorId");
  res.json(events);
};
