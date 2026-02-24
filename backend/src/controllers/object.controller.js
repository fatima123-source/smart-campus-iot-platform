import ObjectModel from "../models/Object.js";

// ===============================
// Ajouter un objet
// ===============================
const createObject = async (req, res) => {
  try {
    const { nomObjet, typeObjet, categorie, statut } = req.body;

    const newObject = new ObjectModel({
      nomObjet,
      typeObjet,
      categorie,
      statut
    });

    await newObject.save();

    res.status(201).json(newObject);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// =====================================================
// ✅ AJOUT 1 : récupérer tous les objets (GET)
// =====================================================
const getObjects = async (req, res) => {
  try {
    const objects = await ObjectModel.find();

    res.status(200).json(objects);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};


// =====================================================
// ✅ AJOUT 2 : modifier un objet (PUT)
// =====================================================
const updateObject = async (req, res) => {
  try {
    const updatedObject = await ObjectModel.findByIdAndUpdate(
      req.params.id,   // ← id vient de /:id dans la route
      req.body,
      { new: true }
    );

    res.json(updatedObject);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};


// =====================================================
// ✅ AJOUT 3 : supprimer un objet (DELETE)
// =====================================================
const deleteObject = async (req, res) => {
  try {
    await ObjectModel.findByIdAndDelete(req.params.id);

    res.json({
      message: "Objet supprimé ✅",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};



// ===============================
// ✅ EXPORT (MODIFIÉ)
// ===============================
export default {
  createObject,
  getObjects,
  updateObject,
  deleteObject
};