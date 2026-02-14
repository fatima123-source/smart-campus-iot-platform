import express from "express";
import {
  createCommand,
  getAllCommands,
  executeCommand
} from "../controllers/commande.controller.js";

const router = express.Router();

router.post("/", createCommand);
router.get("/", getAllCommands);
router.put("/:id/execute", executeCommand);

export default router;
