import createError from "http-errors";
import crypto from "crypto";

const hashSHA256 = (input) => {
  try {
    return crypto.createHash("sha256").update(input).digest("hex");
  } catch (error) {
    console.error("==== hashSHA256 ====\n", error);
    // throw createError(500, "hashing Error");
    throw createError(500);
  }
};

export default hashSHA256;
