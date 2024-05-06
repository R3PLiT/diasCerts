const createError = require("http-errors");
const StandardMerkleTree = require("@openzeppelin/merkle-tree").StandardMerkleTree;

exports.createMerkleTree = (data, dataType) => {
  try {
    return StandardMerkleTree.of(data, dataType);
  } catch (error) {
    console.error("==== createMerkleTree ====\n", error);
    // throw createError(500, "create tree Error");
    throw createError(500);
  }
};

exports.treeDump = (tree) => {
  try {
    return tree.dump();
  } catch (error) {
    console.error("==== treeDump ====\n", error);
    // throw createError(500, "dump data Error");
    throw createError(500);
  }
};

exports.getProofAll = (tree) => {
  try {
    let allProofs = {}; // object key-value pair
    const root = tree.root;
    for (const [i, v] of tree.entries()) {
      allProofs[v[0]] = {
        root: root,
        proofs: tree.getProof(i),
        leaf: v[0],
      };
    }
    return allProofs;
  } catch (error) {
    console.error("==== getProofAll ====\n", error);
    // throw createError(500, "get data Error");
    throw createError(500);
  }
};
