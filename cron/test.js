// import createError from "http-errors";
// import crypto from "crypto";
// import { google } from "googleapis";
// import hashSHA256 from "../utils/hashData.js";
import { hashDriveImage } from "../utils/hashDriveImage.js";

const hashFile = await hashDriveImage("1RPBdsKHVOYjWuEqOg5CqBsVTElJtJs7v");
console.log(hashFile);
// 1RPBdsKHVOYjWuEqOg5CqBsVTElJtJs7v
// 1eGh_bietmKNkeVrxlszaEjs6ImnfL1vb
