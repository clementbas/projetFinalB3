// services/salonService.js
import { salonService } from './api';  // adapte le chemin selon ta structure

const getAllSalons = async () => {
  try {
    const allSalons = await salonService.getAllSalons();
    return allSalons;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const getSalonById = async (id) => {
  try {
    const salon = await salonService.getSalonById(id);
    return salon;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const createSalon = async (salonData) => {
  try {
    const newSalon = await salonService.createSalon(salonData);
    return newSalon;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const updateSalon = async (id, salonData) => {
  try {
    const updatedSalon = await salonService.updateSalon(id, salonData);
    return updatedSalon;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const deleteSalon = async (id) => {
  try {
    const deletedSalon = await salonService.deleteSalon(id);
    return deletedSalon;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const addComment = async (salonId, note, commentaire) => {
  try {
    const comment = await salonService.addComment(salonId, note, commentaire);
    return comment;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export default {
  getAllSalons,
  getSalonById,
  createSalon,
  updateSalon,
  deleteSalon,
  addComment,
};
