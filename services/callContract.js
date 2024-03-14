import createError from "http-errors";
import { getSigner, getContract } from "./connectEthers.js";

export const readContractData = async (functionName, ...args) => {
  try {
    const contract = await getContract();
    const result = await contract.callStatic[functionName](...args);

    return result;
  } catch (error) {
    console.error("==== readContractData ====\n", error);
    throw createError(error.reason ? 400 : 500, error.reason || "Failed read from contract");
  }
};

export const sendContractTransaction = async (functionName, ...args) => {
  try {
    const contract = await getContract();
    const signer = await getSigner();

    const gasLimit = await signer.estimateGas({
      to: contract.address,
      data: contract.interface.encodeFunctionData(functionName, [...args]),
    });

    const tx = await signer.sendTransaction({
      to: contract.address,
      data: contract.interface.encodeFunctionData(functionName, [...args]),
      gasLimit,
    });

    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw createError(500, "Transaction failure");
    }

    return receipt.transactionHash;
  } catch (error) {
    console.error("==== sendContractTransaction ====\n", error);
    throw createError(error.reason ? 400 : 500, error.reason || "Failed read from contract");
  }
};
