const express = require("express");
const register = require("../controllers/mainControllers.js").register;
const userDetail = require("../controllers/usersControllers.js").userDetail;
const authenticateRole = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post("/", authenticateRole("admin"), register);

router.get("/me", authenticateRole("issuer"), userDetail);

module.exports = router;
