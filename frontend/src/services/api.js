import axios from "axios";

// configuration de l'url de base de l'api
const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// création d'une instance axios personnalisée
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// intercepteur de requête (pour ajouter des tokens par exemple)
apiClient.interceptors.request.use(
  (config) => {
    // vous pouvez ajouter un token d'authentification ici
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// intercepteur de réponse (pour gérer les erreurs globalement)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // erreur avec réponse du serveur
      console.error("Erreur API:", error.response.data);
    } else if (error.request) {
      // erreur sans réponse du serveur
      console.error("Pas de réponse du serveur");
    } else {
      // autre erreur
      console.error("Erreur:", error.message);
    }
    return Promise.reject(error);
  }
);

// service api pour les utilisateurs
const userService = {
  // récupérer tous les utilisateurs
  getAll: async (limit = 100) => {
    try {
      const response = await apiClient.get(`/users?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // récupérer un utilisateur par id
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // créer un nouvel utilisateur
  create: async (userData) => {
    try {
      const response = await apiClient.post("/users", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // mettre à jour un utilisateur
  update: async (id, userData) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // supprimer un utilisateur
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // obtenir le nombre d'utilisateurs
  count: async () => {
    try {
      const response = await apiClient.get("/users/stats/count");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// service pour le health check
const healthService = {
  check: async () => {
    try {
      const response = await apiClient.get("/health", {
        baseURL: "http://localhost:3000",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  dbTest: async () => {
    try {
      const response = await apiClient.get("/db-test");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export { userService, healthService, apiClient };
export default apiClient;
