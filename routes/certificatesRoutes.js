import express from "express";
import multer from "multer";
import authenticateRole from "../middlewares/authMiddleware.js";
import {
  certificateJson,
  certificatePNG,
  certificatesList,
  issueCertificates,
  prepareCetificates,
  revokeCertificate,
  sendCertificates,
  verifyCertificate,
} from "../controllers/certificatesControllers.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", authenticateRole("issuer"), certificatesList);

router.get("/:certificateUUID", certificateJson);
router.get("/:certificateUUID/image", certificatePNG);

router.delete("/:certificateUUID/revoke", authenticateRole("issuer"), revokeCertificate);

router.post("/verify", upload.single("certificateFile"), verifyCertificate);

router.post("/prepare", authenticateRole("issuer"), prepareCetificates);
router.post("/issue", authenticateRole("issuer"), issueCertificates);
router.post("/mail", authenticateRole("issuer"), sendCertificates);

export default router;
