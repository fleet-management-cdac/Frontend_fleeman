"use client";

import { useEffect, useState } from "react";
import { fetchStates, fetchCities, fetchHubs } from "../../Services/locationService";

export default function ReturnLocation() {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [hubs, setHubs] = useState([]);

  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [hubId, setHubId] = useState("");

  useEffect(() => {
    fetchStates().then(setStates);
  }, []);

  useEffect(() => {
    if (!stateId) return;
    fetchCities(Number(stateId)).then(setCities);
    setCityId("");
    setHubId("");
    setHubs([]);
  }, [stateId]);

  useEffect(() => {
    if (!cityId) return;
    fetchHubs(Number(cityId)).then(setHubs);
    setHubId("");
  }, [cityId]);

  const getStateId = (s) => s.stateId ?? s.state_id ?? s.id;
  const getStateName = (s) => s.stateName ?? s.state_name;

  const getCityId = (c) => c.cityId ?? c.city_id ?? c.id;
  const getCityName = (c) => c.cityName ?? c.city_name;

  const getHubId = (h) => h.hubId ?? h.hub_id ?? h.id;
  const getHubName = (h) => h.hubName ?? h.hub_name;

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Return Location</h3>

      {/* State */}
      <div className="flex gap-2 mb-2">
        <span>State</span>
        <select
          className="border px-2"
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
        >
          <option value="">Select</option>
          {states
            .map((s) => {
              const id = getStateId(s);
              if (id == null) return null;
              return (
                <option key={`state-${id}`} value={String(id)}>
                  {getStateName(s)}
                </option>
              );
            })
            .filter(Boolean)}
        </select>
      </div>

      {/* City */}
      <div className="flex gap-2 mb-2">
        <span>City</span>
        <select
          className="border px-2"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          disabled={!cities.length}
        >
          <option value="">Select</option>
          {cities
            .map((c) => {
              const id = getCityId(c);
              if (id == null) return null;
              return (
                <option key={`city-${id}`} value={String(id)}>
                  {getCityName(c)}
                </option>
              );
            })
            .filter(Boolean)}
        </select>
      </div>

      {/* Hub */}
      <div className="flex gap-2">
        <span>Hub</span>
        <select
          className="border px-2"
          value={hubId}
          onChange={(e) => setHubId(e.target.value)}
          disabled={!hubs.length}
        >
          <option value="">Select</option>
          {hubs
            .map((h) => {
              const id = getHubId(h);
              if (id == null) return null;
              return (
                <option key={`hub-${id}`} value={String(id)}>
                  {getHubName(h)}
                </option>
              );
            })
            .filter(Boolean)}
        </select>
      </div>
    </div>
  );
}
