import createError from "http-errors";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export const createMerkleTree = (data, dataType) => {
  try {
    return StandardMerkleTree.of(data, dataType);
  } catch (error) {
    console.log("==== createMerkleTree ====\n", error);
    throw createError(500, "create tree Error");
  }
};

export const treeDump = (tree) => {
  try {
    return tree.dump();
  } catch (error) {
    console.log("==== treeDump ====\n", error);
    throw createError(500, "dump data Error");
  }
};

export const getProofAll = (tree) => {
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
    console.log("==== getProofAll ====\n", error);
    throw createError(500, "get data Error");
  }
};
