const API_BASE = "http://localhost:8080/api/locations";

async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  return res.json();
}

export const fetchStates = () =>
  apiFetch(`${API_BASE}/states`);

export const fetchCities = (stateId) =>
  apiFetch(`${API_BASE}/cities/state/${stateId}`);

export const fetchHubs = (cityId) =>
  apiFetch(`${API_BASE}/hubs/city/${cityId}`);
