const express = require("express");
const authenticateRole = require("../middlewares/authMiddleware.js");
const userDetail = require("../controllers/usersControllers.js").userDetail;

const router = express.Router();

router.get("/me", authenticateRole("admin"), userDetail);

module.exports = router;
