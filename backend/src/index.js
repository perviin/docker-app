const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/database");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware de sécurité
app.use(helmet());

// configuration cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// middleware pour parser le json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// test de connexion à la base de données
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() as now, version() as version"
    );
    res.json({
      success: true,
      timestamp: result.rows[0].now,
      version: result.rows[0].version,
      message: "Connexion à la base de données réussie",
    });
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    res.status(500).json({
      success: false,
      error: "Erreur de connexion à la base de données",
      message: error.message,
    });
  }
});

// monter les routes api
app.use("/api", apiRoutes);

// route racine
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      dbTest: "/api/db-test",
      users: "/api/users",
    },
  });
});

// gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route non trouvée",
    path: req.path,
  });
});

// gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur non gérée:", err);
  res.status(500).json({
    success: false,
    error: "Erreur interne du serveur",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// démarrage du serveur
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("Serveur démarré !!");
  console.log(`Port: ${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || "development"}`);
  console.log(`URL: http://localhost:${PORT}`);
});

// gestion propre de l'arrêt
const shutdown = () => {
  console.log("\nSignal d'arrêt reçu, fermeture gracieuse...");

  server.close(() => {
    console.log("Serveur HTTP fermé");

    pool.end(() => {
      console.log("Pool de connexions à la base de données fermé");
      process.exit(0);
    });
  });

  // force la fermeture après 10 secondes
  setTimeout(() => {
    console.error("Forçage de la fermeture après timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// gestion des erreurs non capturées
process.on("unhandledRejection", (reason, promise) => {
  console.error("Promesse rejetée non gérée:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Exception non capturée:", error);
  shutdown();
});
