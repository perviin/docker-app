const { Pool } = require("pg");

//configuration du pool de connexions postgresql
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "appdb",
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD,
  max: 20, //nb maximum de connexions dans le pool
  idleTimeoutMillis: 30000, //fermeture des connexions inactives après 30s
  connectionTimeoutMillis: 2000, //timeout de connexion de 2s
});

//événement de connexion réussie
pool.on("connect", () => {
  console.log("Nouvelle connexion à la base de données établie");
});

//événement d'erreur
pool.on("error", (err) => {
  console.error("Erreur inattendue sur le client PostgreSQL:", err);
  process.exit(-1);
});

//test de connexion au démarrage
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:", err);
  } else {
    console.log("Connexion à la base de données réussie:", res.rows[0].now);
  }
});

module.exports = pool;
