import createError from "http-errors";
import crypto from "crypto";

const hashSHA256 = (input) => {
  try {
    return crypto.createHash("sha256").update(input).digest("hex");
  } catch (error) {
    console.log("==== hashSHA256 ====\n", error);
    throw createError(500, "hashing Error");
  }
};

export default hashSHA256;
