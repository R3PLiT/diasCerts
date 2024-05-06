const express = require("express");
const addInstitute = require("../controllers/institutesControllers.js").addInstitute;
const institutesList = require("../controllers/institutesControllers.js").institutesList;
const authenticateRole = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/", institutesList);
router.post("/", authenticateRole("admin"), addInstitute);

module.exports = router;
