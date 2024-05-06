const createError = require("http-errors");
const getSigner = require("./connectEthers.js").getSigner;
const getContract = require("./connectEthers.js").getContract;

exports.readContractData = async (functionName, ...args) => {
  try {
    const contract = await getContract();
    const result = await contract.callStatic[functionName](...args);

    return result;
  } catch (error) {
    console.error("==== readContractData ====\n", error);
    throw createError(error.reason ? 400 : 500, error.reason || "Internal Server Error");
  }
};

exports.sendContractTransaction = async (functionName, ...args) => {
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
      throw createError(500, "transaction Error");
    }

    return receipt.transactionHash;
  } catch (error) {
    console.error("==== sendContractTransaction ====\n", error);
    throw createError(error.reason ? 400 : 500, error.reason || "Internal Server Error");
  }
};
