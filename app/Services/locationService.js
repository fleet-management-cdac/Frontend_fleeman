const BASE_URL = "http://localhost:8080/api/locations";

export async function getStates() {
  const res = await fetch(`${BASE_URL}/states`);
  return res.json();
}

export async function getCitiesByState(stateId) {
  const res = await fetch(`${BASE_URL}/cities?stateId=${stateId}`);
  return res.json();
}

export async function getHubsByCity(cityId) {
  const res = await fetch(`${BASE_URL}/hubs?cityId=${cityId}`);
  return res.json();
}