// CONSUMO DE API DE RICK AND MORTY

const BASE_URL = 'https://rickandmortyapi.com/api';

export const fetchCharacters = async (page = 1) => {
  const response = await fetch(`${BASE_URL}/character/?page=${page}`);
  const data = await response.json();
  return data;
};

export const fetchCharacterById = async (id) => {
  const response = await fetch(`${BASE_URL}/character/${id}`);
  const data = await response.json();
  return data;
};