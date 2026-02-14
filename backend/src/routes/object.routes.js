import express from "express";
import objectController from "../controllers/object.controller.js";

const router = express.Router();

router.post("/", objectController.createObject);
router.get("/", objectController.getObjects);
router.put("/:id", objectController.updateObject);
router.delete("/:id", objectController.deleteObject);

export default router;
