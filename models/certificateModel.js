import mongoose from "mongoose";

const isValidObjectId = mongoose.Types.ObjectId.isValid;

const certificateSchema = new mongoose.Schema(
  {
    certificateUUID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true, index: true },
    courseName: { type: String, required: true },
    instituteName: { type: String, required: true, index: true },
    certificateId: { type: String, required: true, index: true },
    issueDate: {
      type: String,
      match: [/^\d{8}$/, "issueDate must be exactly 8 digits long"],
      required: true,
    },
    certificateJson: { type: String, required: true },
    certificateHash: { type: String, required: true, unique: true },
    signature: {
      root: { type: String },
      proofs: { type: [String] },
      leaf: { type: String },
    },
    certificateRevoked: { type: Boolean, default: false },
    treeRoot: {
      type: String,
      ref: "CertificateTree",
      validate: {
        validator: async function (value) {
          return await mongoose.model("CertificateTree").exists({ root: value });
        },
        message: "CertificateTree with this root does not exist.",
      },
    },
    transactionHash: { type: String },
    issuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          if (!isValidObjectId(value)) {
            return false;
          }
          return await mongoose.model("User").exists({ _id: value, role: "issuer" });
        },
        message: "Issuer with this ID does not exist.",
      },
    },
    issueBatchId: { type: String, default: "batch" },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
