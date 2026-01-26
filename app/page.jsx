"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  getAllStates,
  getCitiesByState,
  getHubsByCity,
  getAllAirports,
  getAirportsByState,
} from "../services/locationService";

// Searchable Airport Dropdown Component
function SearchableAirportSelect({ airports, value, onChange, name, error, placeholder = "Search airports..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selectedAirport = airports.find(a => (a.airportId || a.id) == value);

  const filteredAirports = airports.filter(airport => {
    const name = (airport.airportName || airport.name || "").toLowerCase();
    const code = (airport.airportCode || airport.code || "").toLowerCase();
    return name.includes(search.toLowerCase()) || code.includes(search.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border rounded-lg bg-white flex justify-between items-center text-sm ${error ? "border-red-500" : "border-gray-300"}`}
      >
        <span className={selectedAirport ? "text-gray-900" : "text-gray-400"}>
          {selectedAirport ? `${selectedAirport.airportName || selectedAirport.name} (${selectedAirport.airportCode || selectedAirport.code})` : placeholder}
        </span>
        <span className="text-gray-400">▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-hidden">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
            className="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
            autoFocus
          />
          <div className="max-h-32 overflow-y-auto">
            {filteredAirports.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">No airports found</div>
            ) : (
              filteredAirports.map((airport) => (
                <button
                  key={airport.airportId || airport.id}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: airport.airportId || airport.id } });
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm"
                >
                  {airport.airportName || airport.name} <span className="text-gray-400">({airport.airportCode || airport.code})</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  // Hero background images (6-image rotation)
const heroImages = [
  "/hero/hero1.png",
  "/hero/hero2.png",
  "/hero/hero3.png",
  "/hero/hero4.png",
  "/hero/hero5.png",
  "/hero/hero6.png",
];

const [currentHero, setCurrentHero] = useState(0);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [allAirports, setAllAirports] = useState([]);
  const [pickupAirports, setPickupAirports] = useState([]);
  const [returnCities, setReturnCities] = useState([]);
  const [returnHubs, setReturnHubs] = useState([]);
  const [returnAirports, setReturnAirports] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    stateId: "", cityId: "", pickupType: "hub", pickupHubId: "", pickupAirportId: "",
    returnStateId: "", returnCityId: "", returnType: "hub", returnHubId: "", returnAirportId: "",
    pickupDate: "", pickupTime: "10:00", returnDate: "", returnTime: "10:00",
  });

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentHero((prev) => (prev + 1) % heroImages.length);
  }, 5000); // change every 5 seconds

  return () => clearInterval(interval);
}, []);

  useEffect(() => { fetchStates(); fetchAllAirports(); }, []);
  useEffect(() => { if (formData.stateId) { fetchCities(formData.stateId); fetchPickupAirports(formData.stateId); } else { setPickupAirports(allAirports); } }, [formData.stateId, allAirports]);
  useEffect(() => { if (formData.cityId) fetchHubs(formData.cityId); }, [formData.cityId]);
  useEffect(() => { if (formData.returnStateId) { fetchReturnCities(formData.returnStateId); fetchReturnAirports(formData.returnStateId); } else { setReturnAirports(allAirports); } }, [formData.returnStateId, allAirports]);
  useEffect(() => { if (formData.returnCityId) fetchReturnHubs(formData.returnCityId); }, [formData.returnCityId]);

  const fetchAllAirports = async () => { try { const r = await getAllAirports(); const d = Array.isArray(r) ? r : r.data || []; setAllAirports(d); setPickupAirports(d); setReturnAirports(d); } catch (e) { console.error(e); } };
  const fetchStates = async () => { try { const r = await getAllStates(); setStates(Array.isArray(r) ? r : r.data || []); } catch (e) { console.error(e); } };
  const fetchCities = async (id) => { try { const r = await getCitiesByState(id); setCities(Array.isArray(r) ? r : r.data || []); } catch (e) { console.error(e); } };
  const fetchHubs = async (id) => { try { const r = await getHubsByCity(id); setHubs(Array.isArray(r) ? r : r.data || []); } catch (e) { console.error(e); } };
  const fetchPickupAirports = async (id) => { try { const r = await getAirportsByState(id); setPickupAirports(Array.isArray(r) ? r : r.data || []); } catch (e) { console.error(e); } };
  const fetchReturnCities = async (id) => { try { const r = await getCitiesByState(id); setReturnCities(Array.isArray(r) ? r : r.data || []); } catch (e) { console.error(e); } };
  const fetchReturnHubs = async (id) => { try { const r = await getHubsByCity(id); setReturnHubs(Array.isArray(r) ? r : r.data || []); } catch (e) { console.error(e); } };
  const fetchReturnAirports = async (id) => { try { const r = await getAirportsByState(id); setReturnAirports(Array.isArray(r) ? r : r.data || []); } catch (e) { console.error(e); } };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
    if (name === "stateId") { setFormData(p => ({ ...p, stateId: value, cityId: "", pickupHubId: "", pickupAirportId: "" })); setCities([]); setHubs([]); }
    if (name === "cityId") { setFormData(p => ({ ...p, cityId: value, pickupHubId: "" })); setHubs([]); }
    if (name === "pickupType") setFormData(p => ({ ...p, pickupType: value, pickupHubId: "", pickupAirportId: "" }));
    if (name === "returnStateId") { setFormData(p => ({ ...p, returnStateId: value, returnCityId: "", returnHubId: "", returnAirportId: "" })); setReturnCities([]); setReturnHubs([]); }
    if (name === "returnCityId") { setFormData(p => ({ ...p, returnCityId: value, returnHubId: "" })); setReturnHubs([]); }
    if (name === "returnType") setFormData(p => ({ ...p, returnType: value, returnHubId: "", returnAirportId: "" }));
  };

  const validateForm = () => {
    const e = {};
    if (formData.pickupType === "hub") { if (!formData.stateId) e.stateId = "Required"; if (!formData.cityId) e.cityId = "Required"; if (!formData.pickupHubId) e.pickupHubId = "Required"; }
    else { if (!formData.pickupAirportId) e.pickupAirportId = "Required"; }
    if (formData.returnType === "hub") { if (!formData.returnStateId) e.returnStateId = "Required"; if (!formData.returnCityId) e.returnCityId = "Required"; if (!formData.returnHubId) e.returnHubId = "Required"; }
    else { if (!formData.returnAirportId) e.returnAirportId = "Required"; }
    if (!formData.pickupDate) e.pickupDate = "Required";
    if (!formData.returnDate) e.returnDate = "Required";
    if (formData.pickupDate && formData.returnDate && new Date(formData.returnDate) < new Date(formData.pickupDate)) e.returnDate = "Invalid";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSearch = () => {
    if (!validateForm()) return;

    // Get the hub_id for pickup - either from hub or from airport's hub
    let pickupHubId = formData.pickupHubId;
    if (formData.pickupType === "airport") {
      const selectedAirport = pickupAirports.find(a => (a.airportId || a.id) == formData.pickupAirportId);
      pickupHubId = selectedAirport?.hubId || selectedAirport?.hub?.id || "";
    }

    // Get the hub_id for return - either from hub or from airport's hub
    let returnHubId = formData.returnHubId;
    if (formData.returnType === "airport") {
      const selectedAirport = returnAirports.find(a => (a.airportId || a.id) == formData.returnAirportId);
      returnHubId = selectedAirport?.hubId || selectedAirport?.hub?.id || "";
    }

    const params = new URLSearchParams({
      pickupHub: pickupHubId,
      returnHub: returnHubId,
      pickupDate: `${formData.pickupDate}T${formData.pickupTime}`,
      returnDate: `${formData.returnDate}T${formData.returnTime}`,
    });
    router.push(`/vehicles?${params.toString()}`);
  };

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const SelectBox = ({ name, value, onChange, disabled, options, placeholder, error, idKey, nameKey }) => (
    <select name={name} value={value} onChange={onChange} disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o[idKey] || o.id} value={o[idKey] || o.id}>{o[nameKey] || o.name}</option>)}
    </select>
  );

  return (
    <>
      <Navbar />
      <section className="relative w-full bg-cover bg-center text-white min-h-[85vh] flex items-center" style={{
  backgroundImage: `url(${heroImages[currentHero]})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}}>
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div></div>
            <Card className="p-5 bg-white/95 backdrop-blur text-gray-900 shadow-xl">
              <h2 className="text-lg font-bold mb-4 text-gray-900">🚗 Find Your Ride</h2>

              <div className="grid grid-cols-2 gap-4">
                {/* PICKUP */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                    <span className="text-sm font-semibold text-gray-700">Pickup</span>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleChange({ target: { name: "pickupType", value: "hub" } })}
                      className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${formData.pickupType === "hub" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>🏢 Hub</button>
                    <button type="button" onClick={() => handleChange({ target: { name: "pickupType", value: "airport" } })}
                      className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${formData.pickupType === "airport" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>✈️ Airport</button>
                  </div>
                  {formData.pickupType === "hub" ? (
                    <>
                      <SelectBox name="stateId" value={formData.stateId} onChange={handleChange} options={states} placeholder="State" error={errors.stateId} idKey="stateId" nameKey="stateName" />
                      <SelectBox name="cityId" value={formData.cityId} onChange={handleChange} disabled={!formData.stateId} options={cities} placeholder="City" error={errors.cityId} idKey="cityId" nameKey="cityName" />
                      <SelectBox name="pickupHubId" value={formData.pickupHubId} onChange={handleChange} disabled={!formData.cityId} options={hubs} placeholder="Hub" error={errors.pickupHubId} idKey="hubId" nameKey="hubName" />
                    </>
                  ) : (
                    <SearchableAirportSelect airports={pickupAirports} value={formData.pickupAirportId} onChange={handleChange} name="pickupAirportId" error={errors.pickupAirportId} placeholder="Search airport..." />
                  )}
                  <div className="flex gap-2">
                    <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} min={minDate}
                      className={`flex-1 px-2 py-2 border rounded-lg text-sm ${errors.pickupDate ? "border-red-500" : "border-gray-300"}`} />
                    <input type="time" name="pickupTime" value={formData.pickupTime} onChange={handleChange}
                      className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>

                {/* RETURN */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                    <span className="text-sm font-semibold text-gray-700">Return</span>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleChange({ target: { name: "returnType", value: "hub" } })}
                      className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${formData.returnType === "hub" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}>🏢 Hub</button>
                    <button type="button" onClick={() => handleChange({ target: { name: "returnType", value: "airport" } })}
                      className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${formData.returnType === "airport" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}>✈️ Airport</button>
                  </div>
                  {formData.returnType === "hub" ? (
                    <>
                      <SelectBox name="returnStateId" value={formData.returnStateId} onChange={handleChange} options={states} placeholder="State" error={errors.returnStateId} idKey="stateId" nameKey="stateName" />
                      <SelectBox name="returnCityId" value={formData.returnCityId} onChange={handleChange} disabled={!formData.returnStateId} options={returnCities} placeholder="City" error={errors.returnCityId} idKey="cityId" nameKey="cityName" />
                      <SelectBox name="returnHubId" value={formData.returnHubId} onChange={handleChange} disabled={!formData.returnCityId} options={returnHubs} placeholder="Hub" error={errors.returnHubId} idKey="hubId" nameKey="hubName" />
                    </>
                  ) : (
                    <SearchableAirportSelect airports={returnAirports} value={formData.returnAirportId} onChange={handleChange} name="returnAirportId" error={errors.returnAirportId} placeholder="Search airport..." />
                  )}
                  <div className="flex gap-2">
                    <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} min={formData.pickupDate || minDate}
                      className={`flex-1 px-2 py-2 border rounded-lg text-sm ${errors.returnDate ? "border-red-500" : "border-gray-300"}`} />
                    <input type="time" name="returnTime" value={formData.returnTime} onChange={handleChange}
                      className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full mt-4" size="lg">Search Vehicles</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Why Choose FLEMAN?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[{ icon: "💰", title: "Transparent Pricing", desc: "No hidden charges" }, { icon: "✅", title: "Easy Booking", desc: "Book in minutes" }, { icon: "📍", title: "Multiple Locations", desc: "Hubs & airports" }].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4"><span className="text-2xl">{f.icon}</span></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Hit the Road?</h2>
          <p className="text-gray-300 mb-6">Join thousands of happy customers.</p>
          <Link href="/register"><Button size="lg" className="bg-blue-600 hover:bg-blue-700">Create Free Account</Button></Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
