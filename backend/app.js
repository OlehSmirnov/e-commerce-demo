import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import paymentRoutes from "./routes/paymentRoutes.js";
import { formatErrorResponse } from "./services/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const allowedOrigins = [
  "https://e-commerce-client-305h.onrender.com",
  "http://localhost:3000",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (typeof origin === 'string' && origin.startsWith('file:')) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.options("*", cors());
app.use(express.json());

// Mount payment routes
app.use("/pay", paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const errorResponse = formatErrorResponse(err);
  const statusCode = err.statusCode || 500;
  console.error(`[${statusCode}] ${err.message}`, err);
  res.status(statusCode).json(errorResponse);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));