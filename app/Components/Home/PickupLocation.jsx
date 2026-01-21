"use client";

import { useEffect, useState } from "react";
import {
  getStates,
  getCitiesByState,
  getHubsByCity
} from "../../Services/locationService";

export default function PickupLocation() {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [hubs, setHubs] = useState([]);

  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");

  useEffect(() => {
    getStates().then(setStates);
  }, []);

  useEffect(() => {
    if (stateId) {
      getCitiesByState(stateId).then(setCities);
      setHubs([]);
    }
  }, [stateId]);

  useEffect(() => {
    if (cityId) {
      getHubsByCity(cityId).then(setHubs);
    }
  }, [cityId]);

  return (
    <div className="mt-4">
      <div className="font-semibold mb-1">Pick-Up Location</div>

      {/* Airport */}
      <div className="flex items-center gap-2 mb-2">
        <span>Enter Airport Code</span>
        <input className="border w-24 px-1" />
        <span className="text-blue-700 underline cursor-pointer">
          Find Airport
        </span>
      </div>

      <div className="text-red-600 font-semibold mb-2">OR</div>

      {/* State / City / Hub */}
      <div className="flex items-center gap-2">
        <span>State</span>
        <select
          className="border px-2"
          onChange={(e) => setStateId(e.target.value)}
        >
          <option value="">Select</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <span>City</span>
        <select
          className="border px-2"
          onChange={(e) => setCityId(e.target.value)}
          disabled={!cities.length}
        >
          <option value="">Select</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <span>Hub</span>
        <select className="border px-2" disabled={!hubs.length}>
          <option value="">Select</option>
          {hubs.map((h) => (
            <option key={h.id}>{h.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
