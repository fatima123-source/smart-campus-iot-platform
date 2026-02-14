# IoT Pipeline - Smart Campus

Ce dossier contient le pipeline IoT :

- sensor_simulator.py → génère les données capteurs
- mqtt_to_atlas.py → stocke dans MongoDB

Les données sont enregistrées dans :

- capteurs (état actuel)
- historique_capteurs (historique)

Communication via MQTT (HiveMQ Cloud)
Stockage via MongoDB Atlas
