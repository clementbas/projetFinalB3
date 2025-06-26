import AsyncStorage from '@react-native-async-storage/async-storage';
import mockSalons from './mockSalons';
import { register, login } from './mockAuth';

// Mock token pour simuler l'authentification
let mockToken = null;

// Services d'authentification mockés
export const authService = {
  login: async (email, password) => {
    try {
      const result = await login(email, password);
      mockToken = 'mocked-jwt-token'; // Simule un token
      await AsyncStorage.setItem('userToken', mockToken);
      await AsyncStorage.setItem('userData', JSON.stringify({ email }));
      return { token: mockToken, user: { email } };
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const result = await register(userData.email, userData.password);
      return result;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    mockToken = null;
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  },
};

// Services pour les salons mockés
export const salonService = {
  getAllSalons: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSalons), 300);
    });
  },

  getSalonById: async (id) => {
    return new Promise((resolve, reject) => {
      const salon = mockSalons.find(s => s.id === id);
      if (salon) {
        setTimeout(() => resolve(salon), 200);
      } else {
        reject(new Error('Salon non trouvé'));
      }
    });
  },

  searchSalonsByLocation: async (latitude, longitude, radius = 5) => {
    // Pour mocker, on retourne tous, ignore les coords
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSalons), 300);
    });
  },

  searchSalonsByPrice: async (minPrice, maxPrice) => {
    return new Promise((resolve) => {
      const filtered = mockSalons.filter(s => s.priceLevel >= minPrice && s.priceLevel <= maxPrice);
      setTimeout(() => resolve(filtered), 300);
    });
  },

  searchSalonsByRating: async (minRating) => {
    return new Promise((resolve) => {
      const filtered = mockSalons.filter(s => s.rating >= minRating);
      setTimeout(() => resolve(filtered), 300);
    });
  },
};

export default {
  auth: authService,
  salons: salonService,
};
