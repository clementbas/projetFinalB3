// services/salonService.js
import { api } from './api'; // ou axios ou fetch selon ce que tu utilises

const getAllSalons = async () => {
  try {
    const response = await api.get('/salons'); // adapte l’endpoint selon ton API
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllSalons,
};
