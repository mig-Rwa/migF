import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getProgress = async (token: string) => {
  const response = await axios.get(`${API_URL}/progress`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addProgress = async (token: string, workout_id: number, notes: string) => {
  const response = await axios.post(
    `${API_URL}/progress`,
    { workout_id, notes },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}; 