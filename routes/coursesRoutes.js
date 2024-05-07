const getAllCourses = require("../controllers/coursesController.js").getAllCourses;
const addCourse = require("../controllers/coursesController.js").addCourse;
const getCourseById = require("../controllers/coursesController.js").getCourseById;
const updateCourseById = require("../controllers/coursesController.js").updateCourseById;
const deleteCourseById = require("../controllers/coursesController.js").deleteCourseById;
const addGraduates = require("../controllers/coursesController.js").addGraduates;
const getGraduates = require("../controllers/coursesController.js").getGraduates;
const getGraduateById = require("../controllers/coursesController.js").getGraduateById;
const updateGraduateById = require("../controllers/coursesController.js").updateGraduateById;
const deleteGraduateById = require("../controllers/coursesController.js").deleteGraduateById;
const express = require("express");
const authenticateRole = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/", authenticateRole("issuer"), getAllCourses);
router.post("/", authenticateRole("issuer"), addCourse);
router.get("/:_id", authenticateRole("issuer"), getCourseById);
router.patch("/:_id", authenticateRole("issuer"), updateCourseById);
router.delete("/:_id", authenticateRole("issuer"), deleteCourseById);

router.post("/:_id/graduates", authenticateRole("issuer"), addGraduates);
router.get("/:_id/graduates", authenticateRole("issuer"), getGraduates);

router.get("/:courseId/graduates/:_id", authenticateRole("issuer"), getGraduateById);
router.patch("/:courseId/graduates/:_id", authenticateRole("issuer"), updateGraduateById);
router.delete("/:courseId/graduates/:_id", authenticateRole("issuer"), deleteGraduateById);

module.exports = router;
