const Notification = require("../models/Notification");

const sendNotification = async (event) => {
  console.log("Notification envoyée pour :", event.nomEvent);

  const notification = new Notification({
    eventId: event._id,
    message: `Alerte: ${event.nomEvent} détecté`,
    date: new Date()
  });

  await notification.save();
};

module.exports = { sendNotification };
