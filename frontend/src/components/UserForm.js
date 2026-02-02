import { useState } from "react";

const UserForm = ({ onCreate }) => {
  const [user, setUser] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!user.username.trim() || !user.email.trim()) {
      return;
    }
    setLoading(true);
    await onCreate(user);
    setUser({ username: "", email: "" });
    setLoading(false);
  };

  const isFormValid = user.username.trim() && user.email.trim();

  return (
    <div className="card">
      <h2>Créer un utilisateur</h2>
      <form onSubmit={submit} className="form">
        <div className="form-row">
          <input
            placeholder="Nom d'utilisateur"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            required
            minLength="2"
          />
          <input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="btn"
          disabled={loading || !isFormValid}
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </div>
  );
};

export default UserForm;
