const UserList = ({ users, loading, onReload }) => {
  return (
    <div className="card">
      <h2>Utilisateurs</h2>

      <button onClick={onReload} disabled={loading} className="btn btn-reload">
        {loading ? (
          <>
            <span className="spinner"></span> Chargement...
          </>
        ) : (
          "Recharger la liste"
        )}
      </button>

      {users.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">—</div>
          <p>Aucun utilisateur trouvé. Créez en un pour commencer!</p>
        </div>
      )}

      {users.length > 0 && (
        <ul className="users-list">
          {users.map((u) => (
            <li key={u.id} className="user-item">
              <div className="user-info">
                <div className="user-name">{u.username}</div>
                <div className="user-email">{u.email}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {users.length > 0 && (
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#999",
            fontSize: "0.9rem",
          }}
        >
          {users.length} utilisateur{users.length > 1 ? "s" : ""} trouvé
          {users.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

export default UserList;
