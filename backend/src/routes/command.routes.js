import express from "express";
import {
  createCommand,
  getAllCommands,
} from "../controllers/commande.controller.js";

const router = express.Router();

router.post("/", createCommand);
router.get("/", getAllCommands);

export default router;
