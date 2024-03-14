import express from "express";
import multer from "multer";
import authenticateRole from "../middlewares/authMiddleware.js";
import {
  certificateJson,
  certificatePNG,
  createCertificateTree,
  issueCertificates,
  prepareCetificates,
  revokeCertificate,
  sendCertificates,
  updateTransactionCertificates,
  verifyCertificate,
} from "../controllers/certificatesControllers.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/:certificateUUID", certificateJson);
router.get("/:certificateUUID/image", certificatePNG);

router.delete("/:certificateUUID/revoke", authenticateRole("issuer"), revokeCertificate);

router.post("/verify", upload.single("certificateFile"), verifyCertificate);

router.post("/prepare", authenticateRole("issuer"), prepareCetificates);
// ---- will move to batch process later ----
router.post("/createtree", authenticateRole("issuer"), createCertificateTree);
router.post("/issue", authenticateRole("issuer"), issueCertificates);
router.patch("/updatetransaction", authenticateRole("issuer"), updateTransactionCertificates);
router.post("/mail", authenticateRole("issuer"), sendCertificates);
// ---- end ----

export default router;
