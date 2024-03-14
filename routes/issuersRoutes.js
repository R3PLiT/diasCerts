import express from "express";
import { register } from "../controllers/mainControllers.js";
import { userDetail } from "../controllers/usersControllers.js";
import authenticateRole from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateRole("admin"), register);

router.get("/me", authenticateRole("issuer"), userDetail);

export default router;
