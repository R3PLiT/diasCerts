import fs from "fs";
import mongoose from "mongoose";
import createError from "http-errors";
import { randomUUID } from "crypto";
import hashSHA256 from "../utils/hashData.js";
import { createMerkleTree, treeDump, getProofAll } from "../utils/merkleTree.js";
import drawCertificate from "../utils/certImage.js";
import mailCertificates from "../utils/mailCerts.js";
import { handleMongooseError, insertDocuments } from "../utils/mongooseUtils.js";
import customDate from "../utils/formatDate.js";
import { hashDriveImage } from "../utils/hashDriveImage.js";
import CertificateTree from "../models/cretificateTreeModel.js";
import Certificate from "../models/certificateModel.js";
import User from "../models/userModel.js";
import { readContractData, sendContractTransaction } from "../services/callContract.js";

export const certificatesList = async (req, res, next) => {
  try {
    const { userId, role } = req.jwt;

    let query = {};

    if (role === "user") {
      const user = await User.findById(userId).select("email -_id");

      if (!user) {
        // throw createError(404, "no data found");
        throw createError(404);
      }

      query = { recipientEmail: { $regex: new RegExp(user.email, "i") } };
    } else {
      const { recipientName, recipientEmail, courseName } = req.query;

      if (recipientName) {
        query.recipientName = { $regex: new RegExp(recipientName, "ui") };
      }

      if (recipientEmail) {
        query.recipientEmail = { $regex: new RegExp(recipientEmail, "i") };
      }

      if (courseName) {
        query.courseName = { $regex: new RegExp(courseName, "ui") };
      }

      query.issuerId = userId;
    }

    const select = "certificateUUID recipientName certificateJson -_id";
    const sort = { issueDate: -1 };

    const documents = await Certificate.find(query).select(select).sort(sort);

    if (documents.length === 0) {
      // throw createError(404, "no data found");
      throw createError(404);
    }

    const certificates = documents.map((document) => ({
      certificateUUID: document.certificateUUID,
      certificateJson: JSON.parse(document.certificateJson),
    }));

    res.send(certificates);
  } catch (error) {
    console.error("==== certificatesList ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "listing certificates Error"));
      next(createError(500));
    }
  }
};

export const certificateJson = async (req, res, next) => {
  try {
    const { certificateUUID } = req.params;

    const query = { certificateUUID };
    const select = "certificateUUID certificateJson certificateHash signature -_id";

    const document = await Certificate.findOne(query).select(select);

    if (!document) {
      // throw createError(404, "no data found");
      throw createError(404);
    }
    if (`0x${hashSHA256(document.certificateJson)}` !== document.certificateHash) {
      return next(createError(500, "certificate data conflict"));
    }

    const certificateData = JSON.parse(document.certificateJson);
    const jsonString = JSON.stringify({
      certificateUUID: document.certificateUUID,
      certificateJson: certificateData,
      certificateHash: document.certificateHash,
      signature: document.signature,
    });

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=${certificateUUID}.json`);
    res.send(jsonString);
  } catch (error) {
    console.error("==== certificateJson ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "create file certificate Error"));
      next(createError(500));
    }
  }
};

export const certificatePNG = async (req, res, next) => {
  try {
    const { certificateUUID } = req.params;

    const query = { certificateUUID };
    const select = "certificateUUID certificateJson certificateHash signature -_id";

    const document = await Certificate.findOne(query).select(select);

    if (!document) {
      // throw createError(404, "no data found");
      throw createError(404);
    }

    if (`0x${hashSHA256(document.certificateJson)}` !== document.certificateHash) {
      return next(createError(500, "certificate data conflict"));
    }

    const certificate = JSON.parse(document.certificateJson);
    if (certificate.certificateDriveImgId) {
      // return res.json({ certificateImage: `https://drive.google.com/file/d/${certificate.certificateDriveImgId}/view` });
      return res.redirect(
        `https://drive.google.com/file/d/${certificate.certificateDriveImgId}/view`
      );
    }

    res.setHeader("Content-Type", "image/png");
    // res.setHeader("Content-Disposition", `attachment; filename=${certificateUUID}.png`);
    const canvas = await drawCertificate(document.certificateJson);
    const stream = canvas.createPNGStream();
    stream.pipe(res);
    res.on("finish", () => {
      res.end();
    });
  } catch (error) {
    console.error("==== certificatePNG ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "create image certificate Error"));
      next(createError(500));
    }
  }
};

export const revokeCertificate = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { certificateUUID } = req.params;
    const { userId } = req.jwt;

    const query = { certificateUUID, issuerId: userId };
    const update = { certificateRevoked: true };
    const options = { session, new: true };

    const document = await Certificate.findOneAndUpdate(query, update, options);

    if (!document) {
      // throw createError(404, "no data found");
      throw createError(404);
    }

    if (`0x${hashSHA256(document.certificateJson)}` !== document.certificateHash) {
      return next(createError(500, "Certificate data conflict"));
    }

    const leaf = document.certificateHash;
    const transactionHash = await sendContractTransaction("revokeLeaf", leaf);
    console.log("transactionHash : ", transactionHash);
    console.log("certificateUUID : ", certificateUUID);
    console.log("certificateHash : ", leaf + "\n");

    await session.commitTransaction();

    res.json({ transactionHash, certificateUUID, certificateHash: leaf });
  } catch (error) {
    await session.abortTransaction();
    console.error("==== revokeCertificate ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "revoke certificate Error"));
      next(createError(500));
    }
  } finally {
    session.endSession();
  }
};

export const verifyCertificate = async (req, res, next) => {
  let certificateFile;
  try {
    certificateFile = req.file.path;
    const certificate = JSON.parse(fs.readFileSync(certificateFile));
    fs.unlinkSync(certificateFile);

    const certificateJson = JSON.stringify(certificate.certificateJson);

    if (
      `0x${hashSHA256(certificateJson)}` !== certificate.certificateHash ||
      certificate.certificateHash !== certificate.signature.leaf
    ) {
      return next(createError(409, "Certificate data conflict"));
    }

    const document = JSON.parse(certificateJson);

    // if (
    //   document.expireDate &&
    //   document.expireDate < customDate.dateFormat("now", "YYYYMMDD", "en")
    // ) {
    //   return next(createError(409, "certificate expired"));
    // }

    const root = certificate.signature.root;
    const proofs = certificate.signature.proofs;
    const leaf = certificate.signature.leaf;

    const result = await readContractData("verifyLeaf", root, proofs, leaf);

    let outURL = "";
    if (result) {
      if (
        document.expireDate &&
        document.expireDate < customDate.dateFormat("now", "YYYYMMDD", "en")
      ) {
        return next(createError(400, "This certificate is valid but EXPIRED"));
      }

      if (document.certificateDriveImgId) {
        const imgHash = await hashDriveImage(obj.certificateDriveImgId);
        if (`0x${imgHash}` === document.certificateDriveImgHash) {
          outURL = JSON.stringify({
            message: "This certificate is valid.",
            certificateData: document,
            certificateDriveImageId: document.certificateDriveImgId,
          });
        } else {
          return next(createError(500, "This certificate is valid but image verify failure"));
        }
      } else {
        const canvas = await drawCertificate(certificateJson);

        outURL = JSON.stringify({
          message: "This certificate is valid.",
          certificateData: document,
          certificateImageBase64: canvas.toDataURL(),
        });
      }
    } else {
      return next(createError(400, "verify cetificate failure"));
    }

    res.type("json").send(outURL);
  } catch (error) {
    if (req.file && fs.existsSync(certificateFile)) {
      fs.unlinkSync(certificateFile);
    }
    console.error("==== verifyCertificate ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "verify certificate Error"));
      next(createError(500));
    }
  }
};

export const prepareCetificates = async (req, res, next) => {
  try {
    const { issueBatchId, certificates } = req.body;

    for (let obj of certificates) {
      if (obj.certificateDriveImgId) {
        const imgHash = await hashDriveImage(obj.certificateDriveImgId);
        obj.certificateDriveImgHash = `0x${imgHash}`;
      }
      const jsonStr = JSON.stringify(obj);
      const hash = hashSHA256(jsonStr);
      obj.certificateJson = jsonStr;
      obj.certificateHash = `0x${hash}`;
    }

    const documents = certificates.map((obj) => ({
      certificateUUID: randomUUID(),
      recipientName: obj.recipientName,
      recipientEmail: obj.recipientEmail,
      courseName: obj.courseName,
      instituteName: obj.instituteName,
      certificateId: obj.certificateId,
      issueDate: obj.issueDate,
      certificateJson: obj.certificateJson,
      certificateHash: obj.certificateHash,
      issuerId: req.jwt.userId,
      issueBatchId,
    }));

    const records = await insertDocuments(Certificate, documents);

    res.json({ message: "Certificates have been prepared", records });
  } catch (error) {
    console.error("==== prepareCetificates ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "prepare certificates Error"));
      next(createError(500));
    }
  }
};

export const issueCertificates = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { issueBatchId } = req.body;
    const { userId } = req.jwt;

    const query = { issueBatchId, issuerId: userId, treeRoot: { $exists: false } };
    const select = "certificateHash -_id";

    const documents = await Certificate.find(query).select(select);

    if (documents.length === 0) {
      // throw createError(404, "no data found");
      throw createError(404);
    }

    const certificatesHash = documents.map((obj) => [obj.certificateHash]);
    const tree = createMerkleTree(certificatesHash, ["bytes32"]);

    const root = tree.root;
    const treeDumpData = treeDump(tree);

    const document = [{ root, treeDumpData }];

    await CertificateTree.create(document, { session });

    const signatures = getProofAll(tree);

    let count = 0;
    for (const key in signatures) {
      const query = { certificateHash: key };
      const update = { $set: { signature: signatures[key], treeRoot: signatures[key].root } };

      const result = await Certificate.updateOne(query, update, { session });

      if (result.matchedCount !== result.modifiedCount) {
        throw createError(500, "update data Error");
      }

      count += result.modifiedCount;
    }

    const transactionHash = await sendContractTransaction("addRoot", root);
    console.log("transactionHash : ", transactionHash);
    console.log("root : ", root);
    console.log("certificates : ", count + "\n");

    await session.commitTransaction();

    res.status(201).json({ transactionHash, root, certificates: count });
  } catch (error) {
    await session.abortTransaction();
    console.error("==== issueCertificates ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "issue certificates Error"));
      next(createError(500));
    }
  } finally {
    session.endSession();
  }
};

export const sendCertificates = async (req, res, next) => {
  try {
    const { root } = req.body;
    const { userId } = req.jwt;

    const query = { treeRoot: root, issuerId: userId };

    const documents = await Certificate.find(query).select(
      "certificateUUID recipientEmail recipientName courseName instituteName"
    );

    if (documents.length === 0) {
      // throw createError(404, "no data found");
      throw createError(404);
    }
    const result = await mailCertificates(documents);

    res.json(result);
  } catch (error) {
    console.error("==== sendCertificates ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "send certificates Error"));
      next(createError(500));
    }
  }
};
