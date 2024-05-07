const certificateJson = require("../controllers/certificatesControllers.js").certificateJson;
const certificatePNG = require("../controllers/certificatesControllers.js").certificatePNG;
const certificatesList = require("../controllers/certificatesControllers.js").certificatesList;
const issueCertificates = require("../controllers/certificatesControllers.js").issueCertificates;
const prepareCetificates = require("../controllers/certificatesControllers.js").prepareCetificates;
const revokeCertificate = require("../controllers/certificatesControllers.js").revokeCertificate;
const sendCertificates = require("../controllers/certificatesControllers.js").sendCertificates;
const verifyCertificate = require("../controllers/certificatesControllers.js").verifyCertificate;
const express = require("express");
const multer = require("multer");
const authenticateRole = require("../middlewares/authMiddleware.js");

// const upload = multer({ dest: "uploads/" });
// const upload = multer({ dest: "tmp/" });
const router = express.Router();

router.get("/", authenticateRole("issuer"), certificatesList);

router.get("/:certificateUUID", certificateJson);
router.get("/:certificateUUID/image", certificatePNG);

router.delete("/:certificateUUID/revoke", authenticateRole("issuer"), revokeCertificate);

// router.post("/verify", upload.single("certificateFile"), verifyCertificate);

router.post("/prepare", authenticateRole("issuer"), prepareCetificates);
router.post("/issue", authenticateRole("issuer"), issueCertificates);
router.post("/mail", authenticateRole("issuer"), sendCertificates);

module.exports = router;
