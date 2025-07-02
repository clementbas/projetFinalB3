import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './http';

// Gestion du token pour les requêtes sécurisées
async function getToken() {
  return await AsyncStorage.getItem('userToken');
}

// Intercepte les erreurs pour récupérer le message utile
function getErrorMessage(error) {
  console.log('Erreur complète:', error);
  
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  
  if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
    return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Timeout: Le serveur met trop de temps à répondre.';
  }
  
  return error.message || 'Erreur inconnue';
}

// Service d'authentification
export const authService = {
  login: async (email, password) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      
      // Adapter les champs pour le backend
      const response = await api.post('/auth/login', { 
        email, 
        motDePasse: password  // Changé: password -> motDePasse
      });
      
      const { token, user } = response.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      console.log('✅ Connexion réussie');
      return { token, user };
    } catch (error) {
      console.log('❌ Erreur de connexion:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 Tentative d\'inscription:', userData);
      
      // Adapter les champs pour le backend
      const backendData = {
        nom: `${userData.firstName} ${userData.lastName}`, // Combiner prénom + nom
        email: userData.email,
        motDePasse: userData.password  // Changé: password -> motDePasse
      };
      
      console.log('📤 Données envoyées au backend:', backendData);
      
      const response = await api.post('/auth/register', backendData);
      
      console.log('✅ Inscription réussie');
      return response.data;
    } catch (error) {
      console.log('❌ Erreur d\'inscription:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  },
};

// Service pour gérer les salons (routes protégées, token nécessaire)
export const salonService = {
  getAllSalons: async () => {
    try {
      const token = await getToken();
      const response = await api.get('/salons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getSalonById: async (id) => {
    try {
      const token = await getToken();
      const response = await api.get(`/salons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  createSalon: async (salonData) => {
    try {
      const token = await getToken();
      const response = await api.post('/salons', salonData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  updateSalon: async (id, salonData) => {
    try {
      const token = await getToken();
      const response = await api.put(`/salons/${id}`, salonData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  deleteSalon: async (id) => {
    try {
      const token = await getToken();
      const response = await api.delete(`/salons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  addComment: async (salonId, note, commentaire) => {
    try {
      const token = await getToken();
      const response = await api.post(`/salons/${salonId}/commentaire`, { note, commentaire }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
// Service pour gérer les rendez-vous (routes protégées, token nécessaire)
export const rendezVousService = {
  getAllRendezVous: async () => {
    try {
      const token = await getToken();
      const response = await api.get('/rendezvous', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getRendezVousById: async (id) => {
    try {
      const token = await getToken();
      const response = await api.get(`/rendezvous/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  createRendezVous: async (salonId, rendezVousData) => {
    try {
      const token = await getToken();
      const response = await api.post(`/rendezvous/${salonId}`, rendezVousData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur brute dans createRendezVous:', error);
      throw new Error(getErrorMessage(error));
    }
  },
  
  
  

  updateRendezVous: async (id, rendezVousData) => {
    try {
      const token = await getToken();
      const response = await api.put(`/rendezvous/${id}`, rendezVousData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  deleteRendezVous: async (id) => {
    try {
      const token = await getToken();
      const response = await api.delete(`/rendezvous/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
};


export default {
  auth: authService,
  salons: salonService,
  rendezvous: rendezVousService,
};
