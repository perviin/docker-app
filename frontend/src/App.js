import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [newUser, setNewUser] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(false);

  // test connexion bdd au chargement
  useEffect(() => {
    axios
      .get("/api/db-test")
      .then((response) => setDbStatus(response.data))
      .catch((error) => console.error("Erreur DB:", error));
  }, []);

  // charger les users
  const loadUsers = () => {
    setLoading(true);
    axios
      .get("/api/users")
      .then((response) => {
        setUsers(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur:", error);
        setLoading(false);
      });
  };

  // créer un user
  const createUser = (e) => {
    e.preventDefault();
    axios
      .post("/api/users", newUser)
      .then(() => {
        setNewUser({ username: "", email: "" });
        loadUsers();
      })
      .catch((error) => console.error("Erreur:", error));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Application Dockerisée</h1>

      {/* statut bdd */}
      <div
        style={{
          padding: "10px",
          background: "#f0f0f0",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <h2>Statut de la base de données</h2>
        {dbStatus ? (
          <p style={{ color: "green" }}>{dbStatus.message}</p>
        ) : (
          <p style={{ color: "orange" }}>Vérification en cours...</p>
        )}
      </div>

      {/* form création user */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Créer un utilisateur</h2>
        <form onSubmit={createUser}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            required
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <button type="submit" style={{ padding: "8px 15px" }}>
            Créer
          </button>
        </form>
      </div>

      {/* liste users */}
      <div>
        <h2>Liste des utilisateurs</h2>
        <button
          onClick={loadUsers}
          disabled={loading}
          style={{ padding: "8px 15px", marginBottom: "10px" }}
        >
          {loading ? "Chargement..." : "Charger les utilisateurs"}
        </button>

        {users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.username} - {user.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun utilisateur à afficher</p>
        )}
      </div>
    </div>
  );
}

export default App;
