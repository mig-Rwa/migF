import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export const addFoodEntry = async (token: string, entry: any) => {
  const response = await axios.post(`${API_URL}/food`, entry, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getFoodEntries = async (token: string, date: string) => {
  const response = await axios.get(`${API_URL}/food?date=${date}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateFoodEntry = async (token: string, id: number, entry: any) => {
  const response = await axios.put(`${API_URL}/food/${id}`, entry, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteFoodEntry = async (token: string, id: number) => {
  const response = await axios.delete(`${API_URL}/food/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}; 