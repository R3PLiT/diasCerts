import express from "express";
import institutesRoutes from "./institutesRoutes.js";
import issuersRoutes from "./issuersRoutes.js";
import usersRoutes from "./usersRoutes.js";
import certificatesRoutes from "./certificatesRoutes.js";
import { register, login } from "../controllers/mainControllers.js";
// import authenticateRole from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.use("/institutes", institutesRoutes);
router.use("/issuers", issuersRoutes);
router.use("/users", usersRoutes);
router.use("/certificates", certificatesRoutes);

export default router;
