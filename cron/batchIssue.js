const cron = require("node-cron");
const mongoose = require("mongoose");
const connectToDatabase = require("../services/connectMongo.js");
const createMerkleTree = require("../utils/merkleTree.js").createMerkleTree;
const treeDump = require("../utils/merkleTree.js").treeDump;
const getProofAll = require("../utils/merkleTree.js").getProofAll;
const mailCertificates = require("../utils/mailCerts.js");
const customDate = require("../utils/formatDate.js");
const CertificateTree = require("../models/cretificateTreeModel.js");
const Certificate = require("../models/certificateModel.js");
const sendContractTransaction = require("../services/callContract.js").sendContractTransaction;

const issueCertificates = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const issueBatchId = "batch";

    const query = { issueBatchId, treeRoot: { $exists: false } };
    const select = "certificateHash -_id";

    const documents = await Certificate.find(query).select(select);

    if (documents.length === 0) {
      // throw new Error("no data found");
      console.log("no data found");
      return;
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
      const update = {
        $set: { signature: signatures[key], treeRoot: signatures[key].root },
      };

      const result = await Certificate.updateOne(query, update, { session });

      if (result.matchedCount !== result.modifiedCount) {
        throw new Error("update data Error");
      }

      count += result.modifiedCount;
    }

    const transactionHash = await sendContractTransaction("addRoot", root);
    console.log("transactionHash : ", transactionHash);
    console.log("root : ", root);
    console.log("certificates : ", count + "\n");

    await session.commitTransaction();

    return root;
  } catch (error) {
    await session.abortTransaction();
    console.error("==== issueCertificates ====\n", error);
    throw new Error("issueCertificates Error");
  } finally {
    session.endSession();
  }
};

const sendCertificates = async (root) => {
  try {
    const query = { treeRoot: root };

    const documents = await Certificate.find(query).select(
      "certificateUUID recipientEmail recipientName courseName instituteName"
    );

    if (documents.length === 0) {
      // throw new Error("no data found");
      console.log("no data found");
    } else {
      const result = await mailCertificates(documents);
      console.log(result);
    }
  } catch (error) {
    console.error("==== sendCertificates ====\n", error);
    throw new Error("sendCertificates Error");
  }
};

const batchIssue = async () => {
  try {
    await connectToDatabase();
    const root = await issueCertificates();
    if (root) {
      await sendCertificates(root);
    }
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error:", error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected");
    }
  }
};

console.log("running ....");
cron.schedule(
  "24 01 * * *",
  async () => {
    console.log(`==== ${customDate.dateFormat("now", "DD/MM/YYYY hh:mm:ssa", "en")} ====`);
    await batchIssue();
    console.log("running ....");
  },
  {
    timezone: "Asia/Bangkok",
  }
);
