// src/routes/subscription.routes.js
import express from "express";
import { createSubscription } from "../controllers/subscription.controller.js";

const router = express.Router();

router.post("/", createSubscription);

export default router;