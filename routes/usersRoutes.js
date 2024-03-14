import express from "express";
import authenticateRole from "../middlewares/authMiddleware.js";
import { userDetail } from "../controllers/usersControllers.js";
import { certificatesList } from "../controllers/certificatesControllers.js";

const router = express.Router();

router.get("/me", authenticateRole("user"), userDetail);
router.get("/me/certificates", authenticateRole("user"), certificatesList);

export default router;
