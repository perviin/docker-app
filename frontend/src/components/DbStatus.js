const DbStatus = ({ dbStatus }) => {
  const getStatusBadgeClass = () => {
    if (!dbStatus) return "loading";
    return dbStatus.status === "error" ? "error" : "success";
  };

  const getStatusIcon = () => {
    if (!dbStatus) return "⌛";
    return dbStatus.status === "error" ? "✗" : "✓";
  };

  return (
    <div className="card">
      <h2>Base de données</h2>
      <div className="db-status-box">
        <div className="db-status-icon">{getStatusIcon()}</div>
        <div className="db-status-text">
          <p>{dbStatus?.message || "Vérification en cours..."}</p>
        </div>
        <span className={`status-badge ${getStatusBadgeClass()}`}>
          {!dbStatus
            ? "Vérification..."
            : dbStatus.status === "error"
              ? "Erreur"
              : "Connectée"}
        </span>
      </div>
    </div>
  );
};

export default DbStatus;
