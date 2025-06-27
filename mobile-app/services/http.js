import axios from 'axios';
import Constants from 'expo-constants';

// Configuration pour Expo Go
const getBaseURL = () => {
  // En développement avec Expo Go, utilise l'IP de ton Mac
  if (__DEV__) {
    // REMPLACE cette IP par celle de ton Mac !
    const MAC_IP = '192.168.1.112'; // <- CHANGE MOI !
    return `http://${MAC_IP}:5002/api`;
  }
  
  // En production, utilise ton API déployée
  return 'https://ton-api-deployee.com/api';
};

const BASE_URL = getBaseURL();

console.log('🌐 API URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test de connexion au démarrage
const testConnection = async () => {
  try {
    console.log('🔍 Test de connexion API...');
    const testUrl = BASE_URL.replace('/api', '/api/test');
    const response = await axios.get(testUrl, { timeout: 5000 });
    console.log('✅ API accessible:', response.data.message);
  } catch (error) {
    console.log('❌ API non accessible:', error.message);
    console.log('💡 Vérifications:');
    console.log('1. Ton Mac et iPhone sont sur le même WiFi?');
    console.log('2. L\'IP dans http.js est correcte?');
    console.log('3. Le serveur backend est démarré?');
    console.log('4. Firewall Mac désactivé?');
  }
};

// Lancer le test
testConnection();

// Intercepteurs pour debug
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('📤 Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.log('❌ Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log('❌ Response error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏱️ Timeout: Serveur trop lent');
    } else if (!error.response) {
      console.log('🌐 Network Error: Vérifier WiFi et IP');
    }
    
    return Promise.reject(error);
  }
);

export default api;