require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abi = [
  "function transfer(address to, uint256 amount) public returns (bool)"
];

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);

app.post("/reward", async (req, res) => {
  const { playerAddress, amount } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    console.log("Sending reward:", amount);

    const tokenAmount = ethers.parseUnits(amount.toString(), 18);

    const tx = await contract.transfer(playerAddress, tokenAmount);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});