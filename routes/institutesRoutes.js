import express from "express";
import { addInstitute, institutesList } from "../controllers/institutesControllers.js";
import authenticateRole from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", institutesList);
router.post("/", authenticateRole("admin"), addInstitute);

export default router;
