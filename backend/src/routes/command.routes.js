import express from "express";
import {
  createCommand,
  getAllCommands,
  executeCommand,
  rejectCommand,
  deleteCommand
} from "../controllers/commande.controller.js";

const router = express.Router();

router.post("/", createCommand);
router.get("/", getAllCommands);
router.put("/:id/execute", executeCommand);
router.put("/:id/reject", rejectCommand);
router.delete("/:id", deleteCommand);

export default router;