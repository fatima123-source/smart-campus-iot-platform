const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

router.post('/', eventController.createEvent);  // créer un événement
router.get('/', eventController.getAllEvents); // récupérer tous les événements

module.exports = router;
