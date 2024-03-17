import express from "express";
import authenticateRole from "../middlewares/authMiddleware.js";
import { userDetail } from "../controllers/usersControllers.js";

const router = express.Router();

router.get("/me", authenticateRole("admin"), userDetail);

export default router;
