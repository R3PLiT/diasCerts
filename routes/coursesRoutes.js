import express from "express";
import authenticateRole from "../middlewares/authMiddleware.js";
import {
  getAllCourses,
  addCourse,
  getCourseById,
  updateCourseById,
  deleteCourseById,
  addGraduates,
  getGraduates
} from "../controllers/coursesController.js";

const router = express.Router();

router.get("/", authenticateRole("issuer"), getAllCourses);
router.post("/", authenticateRole("issuer"), addCourse);
router.get("/:_id", authenticateRole("issuer"), getCourseById);
router.patch("/:_id", authenticateRole("issuer"), updateCourseById);
router.delete("/:_id", authenticateRole("issuer"), deleteCourseById);

router.post("/:_id/graduates", authenticateRole("issuer"), addGraduates);
router.get("/:_id/graduates", authenticateRole("issuer"), getGraduates);

export default router;
