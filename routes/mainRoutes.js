const register = require("../controllers/mainControllers.js").register;
const login = require("../controllers/mainControllers.js").login;
const emailExists = require("../controllers/mainControllers.js").emailExists;
const express = require("express");
const adminsRoutes = require("./adminsRoutes.js");
const institutesRoutes = require("./institutesRoutes.js");
const issuersRoutes = require("./issuersRoutes.js");
const usersRoutes = require("./usersRoutes.js");
const coursesRoutes = require("./coursesRoutes.js");
const certificatesRoutes = require("./certificatesRoutes.js");
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

module.exports = router;
