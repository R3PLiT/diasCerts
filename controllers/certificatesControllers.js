import fs from "fs";
import createError from "http-errors";
import { randomUUID } from "crypto";
import hashSHA256 from "../utils/hashData.js";
import { createMerkleTree, treeDump, getProofAll } from "../utils/merkleTree.js";
import customDate from "../utils/formatDate.js";
import drawCertificate from "../utils/certImage.js";
import CertificateTree from "../models/cretificateTreeModel.js";
import Certificate from "../models/certificateModel.js";
import User from "../models/userModel.js";
import { readContractData, sendContractTransaction } from "../services/callContract.js";
import { findBy_id, findByQuery, findOneByQuery } from "../services/selectData.js";
import {
  bulkInsert,
  insertMasterUpdateChild,
  updateMasterAndChild,
} from "../services/insertData.js";
import mailCertificates from "../services/mailCerts.js";

export const certificatesList = async (req, res, next) => {
  try {
    const { userId } = req.jwt;

    const user = await findBy_id(User, userId);

    const query = { recipientEmail: { $regex: new RegExp(user.email, "i") } };
    const select = "certificateUUID recipientName certificateJson -_id";
    const sort = { issueDate: -1 };

    const documents = await findByQuery(Certificate, query, select, sort);

    const certificates = documents.map((document) => ({
      certificateUUID: document.certificateUUID,
      certificateJson: JSON.parse(document.certificateJson),
    }));

    res.send(certificates);
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== certificatesList ====\n", error);
      next(createError(500, "Failed to list certificates"));
    }
  }
};

export const certificateJson = async (req, res, next) => {
  try {
    const { certificateUUID } = req.params;

    const query = { certificateUUID };
    const select = "certificateUUID certificateJson certificateHash signature -_id";

    const certificate = await findOneByQuery(Certificate, query, select);

    if (`0x${hashSHA256(certificate.certificateJson)}` !== certificate.certificateHash) {
      return next(createError(500, "Certificate data conflict"));
    }

    const certificateData = JSON.parse(certificate.certificateJson);
    const jsonString = JSON.stringify({
      certificateUUID: certificate.certificateUUID,
      certificateJson: certificateData,
      certificateHash: certificate.certificateHash,
      signature: certificate.signature,
    });

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=${certificateUUID}.json`);
    res.send(jsonString);
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== certificateJson ====\n", error);
      next(createError(500, "get certificate Error"));
    }
  }
};

export const certificatePNG = async (req, res, next) => {
  try {
    const { certificateUUID } = req.params;

    const query = { certificateUUID };
    const select = "certificateUUID certificateJson certificateHash signature -_id";

    const certificate = await findOneByQuery(Certificate, query, select);

    if (`0x${hashSHA256(certificate.certificateJson)}` !== certificate.certificateHash) {
      return next(createError(500, "Certificate data conflict"));
    }

    res.setHeader("Content-Type", "image/png");
    // res.setHeader("Content-Disposition", `attachment; filename=${certificateUUID}.png`);
    const canvas = await drawCertificate(certificate.certificateJson);
    const stream = canvas.createPNGStream();
    stream.pipe(res);
    res.on("finish", () => {
      res.end();
    });
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== certificatePNG ====\n", error);
      next(createError(500, "get certificate Error"));
    }
  }
};

export const revokeCertificate = async (req, res, next) => {
  try {
    const { certificateUUID } = req.params;

    const query = { certificateUUID };
    const select = "certificateUUID certificateJson certificateHash signature -_id";

    const certificate = await findOneByQuery(Certificate, query, select);

    if (`0x${hashSHA256(certificate.certificateJson)}` !== certificate.certificateHash) {
      return next(createError(500, "Certificate data conflict"));
    }

    const leaf = certificate.certificateHash;
    const transactionHash = await sendContractTransaction("revokeLeaf", leaf);

    const updateFields = { certificateRevoked: true };

    const output = await Certificate.updateOne(query, { $set: updateFields });

    res.json({ transactionHash });
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== revokeCertificate ====\n", error);
      next(createError(500, "revoke certificate Error"));
    }
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
      return next(createError(400, "Certificate data conflict"));
    }

    const root = certificate.signature.root;
    const proofs = certificate.signature.proofs;
    const leaf = certificate.signature.leaf;

    const result = await readContractData("verifyLeaf", root, proofs, leaf);

    let outURL = "";
    if (result) {
      const canvas = await drawCertificate(certificateJson);
      outURL = `{ "message": "This certificate is valid.", "certificateData":${certificateJson}, "certificateImageBase64":"${canvas.toDataURL()}"}`;
    } else {
      return next(createError(500, "error verify cetificate"));
    }

    res.type("json").send(outURL);
  } catch (error) {
    if (req.file && fs.existsSync(certificateFile)) {
      fs.unlinkSync(certificateFile);
    }
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== revokeCertificate ====\n", error);
      next(createError(500, "verify certificate Error"));
    }
  }
};

export const prepareCetificates = async (req, res, next) => {
  try {
    const { issueBatchId, certificates } = req.body;

    for (let obj of certificates) {
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

    const records = await bulkInsert(Certificate, documents);

    res.json({ message: "Certificates have been prepared", records });
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== prepareCetificates ====\n", error);
      next(createError(500, "prepare certificate Error"));
    }
  }
};

export const createCertificateTree = async (req, res, next) => {
  try {
    const { issueBatchId } = req.body;

    const result = await Certificate.find({
      issueBatchId,
      treeRoot: { $exists: false },
    }).select("certificateHash -_id");

    const certificatesHash = result.map((obj) => [obj.certificateHash]);
    const tree = createMerkleTree(certificatesHash, ["bytes32"]);

    const root = tree.root;
    const treeDumpData = treeDump(tree);
    const signatures = getProofAll(tree);

    const document = [{ root, treeDumpData }];

    let documents = [];
    for (const key in signatures) {
      documents.push({
        query: { certificateHash: key },
        updateFields: { signature: signatures[key], treeRoot: signatures[key].root },
      });
    }

    const certificatesCount = await insertMasterUpdateChild(
      CertificateTree,
      document,
      Certificate,
      documents
    );

    res.json({ root, certificatesCount });
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== createCertificateTree ====\n", error);
      next(createError(500, "create Merkletree Error"));
    }
  }
};

export const issueCertificates = async (req, res, next) => {
  try {
    const { root } = req.body;

    const transactionHash = await sendContractTransaction("addRoot", root);

    res.json({ transactionHash });
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== issueCertificates ====\n", error);
      next(createError(500, "issue certificates Error"));
    }
  }
};

export const updateTransactionCertificates = async (req, res, next) => {
  try {
    const { root, transactionHash } = req.body;

    const document = {
      query: { root },
      updateFields: {
        transactionHash,
        insertTransactionDate: customDate.dateFormat("now", "YYYYMMDD", "en"),
      },
    };

    const documents = [
      {
        query: { treeRoot: root },
        updateFields: { transactionHash },
      },
    ];

    const certificatesCount = await updateMasterAndChild(
      CertificateTree,
      document,
      Certificate,
      documents
    );
    res.json({ transactionHash, certificatesCount });
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("====updateCertificates ====\n", error);
      next(createError(500, "update certificates Error"));
    }
  }
};

export const sendCertificates = async (req, res, next) => {
  try {
    const { transactionHash } = req.body;

    const query = { transactionHash };

    const results = await Certificate.find(query).select(
      "certificateUUID recipientEmail recipientName courseName instituteName"
    );

    const result = await mailCertificates(results);

    res.json(result);
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== sendCertificates ====\n", error);
      next(createError(500, "send certificates Error"));
    }
  }
};

// export const findCertsByRecNameHandler = async (req, res, next) => {
//   try {
//     const { recipientNameStr } = req.params;

//     const query = { recipientName: { $regex: new RegExp(recipientNameStr, "ui") } };

//     const certificates = await Certificate.find(query)
//       .select("certificateUUID recipientName certificateJson -_id ")
//       .sort({ recipientName: 1 });

//     if (certificates.length === 0) {
//       // return res.status(404).json({ message: "Institute not found" });
//       return next(createError(404, "no certificate found"));
//     }

//     const documents = certificates.map((certificate) => ({
//       certificateUUID: certificate.certificateUUID,
//       certificateJson: JSON.parse(certificate.certificateJson),
//     }));
//     res.send(documents);
//   } catch (error) {
//     console.log("Error getJsonCertHandler :", error);
//     next(createError(500, "Failed to get certificate"));
//   }
// };
