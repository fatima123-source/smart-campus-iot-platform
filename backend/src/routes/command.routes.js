import express from "express";
import {
  createCommand,
  getAllCommands,
  executeCommand,
  rejectCommand  // 👈 AJOUTER CETTE LIGNE
} from "../controllers/commande.controller.js";

const router = express.Router();

router.post("/", createCommand);
router.get("/", getAllCommands);
router.put("/:id/execute", executeCommand);
router.put("/:id/reject", rejectCommand);  // 👈 AJOUTER CETTE ROUTE

export default router;