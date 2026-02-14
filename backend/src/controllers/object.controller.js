import ObjectModel from "../models/Object.js";

// ===============================
// Ajouter un objet
// ===============================
const createObject = async (req, res) => {
  try {
    const { nomObjet, type, statut } = req.body;

    if (!nomObjet || !type || !statut) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires",
      });
    }

    const newObject = new ObjectModel({
      nomObjet,
      type,
      statut,
    });

    await newObject.save();

    res.status(201).json({
      message: "Objet enregistré avec succès ✅",
      data: newObject,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// Récupérer tous les objets
// ===============================
const getObjects = async (req, res) => {
  try {
    const objects = await ObjectModel.find();
    res.json(objects);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// Modifier un objet
// ===============================
const updateObject = async (req, res) => {
  try {
    const updated = await ObjectModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// Supprimer un objet
// ===============================
const deleteObject = async (req, res) => {
  try {
    await ObjectModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Objet supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// Export
// ===============================
export default {
  createObject,
  getObjects,
  updateObject,
  deleteObject,
};
