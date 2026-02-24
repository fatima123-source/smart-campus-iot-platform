import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


export const getAllSalles = () =>
  api.get("/data/salles");


export const getCapteurs = (filters = {}) =>
  api.get("/data/capteurs", { params: filters });


export const getHistorique = (salleId) =>
  api.get(`/data/historique/${salleId}`);

export default api;