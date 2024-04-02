import express from "express";
import authenticateRole from "../middlewares/authMiddleware.js";
import {
  userDetail,
  getAllUser,
  getUserById,
  deleteUserById,
  updateUserById,
} from "../controllers/usersControllers.js";
import { certificatesList } from "../controllers/certificatesControllers.js";

const router = express.Router();

router.get("/me", authenticateRole("user"), userDetail);
router.get("/me/certificates", authenticateRole("user"), certificatesList);

router.get("/", getAllUser);
router.get("/:_id", getUserById);
router.delete("/:_id", deleteUserById);
router.patch("/:_id", updateUserById);

export default router;
