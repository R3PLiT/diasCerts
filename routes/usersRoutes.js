const userDetail = require("../controllers/usersControllers.js").userDetail;
const getAllUser = require("../controllers/usersControllers.js").getAllUser;
const getUserById = require("../controllers/usersControllers.js").getUserById;
const deleteUserById = require("../controllers/usersControllers.js").deleteUserById;
const updateUserById = require("../controllers/usersControllers.js").updateUserById;
const express = require("express");
const authenticateRole = require("../middlewares/authMiddleware.js");
const certificatesList = require("../controllers/certificatesControllers.js").certificatesList;

const router = express.Router();

router.get("/me", authenticateRole("user"), userDetail);
router.get("/me/certificates", authenticateRole("user"), certificatesList);

router.get("/", getAllUser);
router.get("/:_id", getUserById);
router.delete("/:_id", deleteUserById);
router.patch("/:_id", updateUserById);

module.exports = router;
