require("dotenv/config");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const multer = require("multer");
const createError = require("http-errors");
const connectToDatabase = require("./services/connectMongo.js");
const connectEthereum = require("./services/connectEthers.js").connectEthereum;
const mainRoutes = require("./routes/mainRoutes.js");
const errorHandler = require("./middlewares/errorMiddleware.js");

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(multer({ dest: "uploads/" }).any());

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

connectDB();

// Connect to Ethereum Sepolia
const connectETH = async () => {
  try {
    await connectEthereum();
  } catch (error) {
    console.error("Initializing Ethereum error:", error);
  }
};

connectETH();

// Routes
app.use("/", mainRoutes);

// Handling undefined routes
app.use((req, res, next) => {
  return next(createError(404, "Page not Found"));
  // return next(createError(404));
});

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening at port:${port}`);
});
