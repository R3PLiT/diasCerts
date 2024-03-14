import mongoose from "mongoose";

const certificateTreeSchema = new mongoose.Schema(
  {
    root: { type: String, required: true, unique: true, index: true },
    treeDumpData: { type: mongoose.Schema.Types.Mixed, required: true },
    transactionHash: { type: String, index: true },
    insertTransactionDate: { type: String },
    rootRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CertificateTree = mongoose.model("CertificateTree", certificateTreeSchema);

export default CertificateTree;
