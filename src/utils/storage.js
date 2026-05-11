import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'sana_sana_data';

export const getData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveData = (newData) => {
  const existingData = getData();
  const dataWithIds = newData.map(item => ({
    id: uuidv4(),
    ...item
  }));
  const updatedData = [...dataWithIds, ...existingData];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};

export const deleteItem = (id) => {
  const existingData = getData();
  const updatedData = existingData.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
};
