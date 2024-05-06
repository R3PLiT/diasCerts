require("dotenv/config");
const createError = require("http-errors");
const crypto = require("crypto");
const google = require("googleapis").google;

const drive = google.drive({
  version: "v3",
  auth: process.env.GOOGLE_AUTHKEY,
});

exports.hashDriveImage = async (fileId) => {
  try {
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");

      response.data.on("data", (chunk) => {
        hash.update(chunk);
      });

      response.data.on("end", () => {
        const fileHash = hash.digest("hex");
        resolve(fileHash);
      });

      response.data.on("error", (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error("==== hashGoogleImage ====\n", error);
    throw createError(500);
  }
};
