import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
// import multer from "multer";
import createError from "http-errors";
import connectToDatabase from "./services/connectMongo.js";
import { connectEthereum } from "./services/connectEthers.js";
import mainRoutes from "./routes/mainRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";

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
try {
  await connectToDatabase();
} catch (error) {
  console.error("Database connection error:", error);
  process.exit(1);
}

// Connect to Ethereum Sepolia
try {
  await connectEthereum();
} catch (error) {
  console.error("Initializing Ethereum error:", error);
}

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
