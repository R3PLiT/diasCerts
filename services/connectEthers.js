import "dotenv/config";
import fs from "fs";
import { ethers } from "ethers";

let provider;
let signer;
let contract;

export const connectEthereum = async () => {
  try {
    if (!provider) {
      const rpcURL = process.env.SEPOLIA_ALCHEMY;
      provider = new ethers.providers.JsonRpcProvider(rpcURL);
      console.log("provider created");
    }

    if (!signer) {
      const privateKey = process.env.SINGER_KEY;
      signer = new ethers.Wallet(privateKey, provider);
      console.log("signer created");
    }

    if (!contract) {
      const contractABI = JSON.parse(fs.readFileSync(process.env.CONTRACT_FILE));
      const contractAddress = process.env.CONTRACT_ADDR;
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("contract created");
    }
  } catch (error) {
    console.error("Error initializing Ethereum:", error);
    throw new Error("Failed to initialize Ethereum");
  }
};

export const getProvider = async () => {
  if (!provider) {
    await connectEthereum();
  }
  return provider;
};

export const getSigner = async () => {
  if (!signer) {
    await connectEthereum();
  }
  return signer;
};

export const getContract = async () => {
  if (!contract) {
    await connectEthereum();
  }
  return contract;
};
