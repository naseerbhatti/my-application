/* Deps */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dns from "dns";

/* Config */
import globalRateLimiter from "./middlewares/rateLimit/index.js";
import router from "./routes/index.js";

const app = express();

const isDev = process.env.NODE_ENV === "development";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://sbca-library-mangment-system.vercel.app",
];

// CORS configuration - allow specific origins when using credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Requests without Origin: Postman, curl, server-to-server, etc.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  exposedHeaders: ["set-cookie"],
};


/* App level middlewares */
app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  helmet({
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
  }),
);
app.disable("x-powered-by");
app.use(globalRateLimiter(60, 1));

// HTTP request logger
if (isDev) {
  app.use(morgan("dev")); // colored output for development
} else {
  app.use(morgan("combined")); // standard Apache combined log format for production
}

/* Api router */
app.use("/api", router);

/* Health Check & Error Handlers */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    version: "1.0.0",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Global Error =>", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
