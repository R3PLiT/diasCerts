import express from "express";
import { addInstitutes, institutesList } from "../controllers/institutesControllers.js";

const router = express.Router();

router.get("/", institutesList);
router.post("/", addInstitutes);

export default router;
