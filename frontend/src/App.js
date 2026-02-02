import React, { useEffect, useState } from "react";
import { userService, healthService } from "./services/api";
import DbStatus from "./components/DbStatus";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  // test connexion DB
  useEffect(() => {
    healthService
      .dbTest()
      .then(setDbStatus)
      .catch(() => setDbStatus({ message: "Erreur DB", status: "error" }));
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const data = await userService.getAll();
      setUsers(data.data || []);
    } catch (err) {
      setError("Impossible de charger les utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  };

  const createUser = async (user) => {
    try {
      await userService.create(user);
      loadUsers();
      setError(null);
    } catch (err) {
      setError("Erreur lors de la création de l'utilisateur");
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Gestion d'Utilisateurs</h1>
        <p>Application Dockerisée</p>
      </div>

      <div className="app-content">
        <DbStatus dbStatus={dbStatus} />

        <UserForm onCreate={createUser} />

        <UserList users={users} loading={loadingUsers} onReload={loadUsers} />

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default App;
