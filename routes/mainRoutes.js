import express from "express";
import adminsRoutes from "./adminsRoutes.js";
import institutesRoutes from "./institutesRoutes.js";
import issuersRoutes from "./issuersRoutes.js";
import usersRoutes from "./usersRoutes.js";
import coursesRoutes from "./coursesRoutes.js";
import certificatesRoutes from "./certificatesRoutes.js";
import {
  register,
  login,
  emailExists,
} from "../controllers/mainControllers.js";
// import authenticateRole from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/emails/:email", emailExists);

router.use("/admins", adminsRoutes);
router.use("/institutes", institutesRoutes);
router.use("/issuers", issuersRoutes);
router.use("/users", usersRoutes);
router.use("/courses", coursesRoutes);
router.use("/certificates", certificatesRoutes);

export default router;
