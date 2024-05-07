const createError = require("http-errors");
const crypto = require("crypto");

const hashSHA256 = (input) => {
  try {
    return crypto.createHash("sha256").update(input).digest("hex");
  } catch (error) {
    console.error("==== hashSHA256 ====\n", error);
    // throw createError(500, "hashing Error");
    throw createError(500);
  }
};

module.exports = hashSHA256;
