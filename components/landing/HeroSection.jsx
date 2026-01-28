'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '../../context/I18nContext';
import { toast } from 'react-toastify';
import Button from '../ui/Button';
import {
    getAllStates,
    getCitiesByState,
    getHubsByCity,
    getAllAirports,
    getAirportsByState,
} from '../../services/locationService';

// Modern Searchable Airport Dropdown
function SearchableAirportSelect({ airports, value, onChange, name, error, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef(null);

    const selectedAirport = airports.find(a => (a.airportId || a.id) == value);
    const filteredAirports = airports.filter(airport => {
        const n = (airport.airportName || airport.name || "").toLowerCase();
        const c = (airport.airportCode || airport.code || "").toLowerCase();
        return n.includes(search.toLowerCase()) || c.includes(search.toLowerCase());
    });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative group">
            <button type="button" onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 text-left border rounded-xl bg-white/95 backdrop-blur-sm flex justify-between items-center text-sm font-medium transition-all shadow-sm group-hover:shadow-md
                ${error ? "border-red-400 ring-1 ring-red-400" : "border-white/20 focus:ring-2 focus:ring-blue-500/50"}`}>
                <span className={selectedAirport ? "text-gray-900" : "text-gray-500"}>
                    {selectedAirport ? `${selectedAirport.airportName || selectedAirport.name} (${selectedAirport.airportCode || selectedAirport.code})` : placeholder}
                </span>
                <span className="text-gray-400 text-xs">▼</span>
            </button>
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-hidden animate-fade-in-up">
                    <div className="p-2 border-b border-gray-100">
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" autoFocus />
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredAirports.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-sm text-center">No airports found</div>
                        ) : (
                            filteredAirports.map((airport) => (
                                <button key={airport.airportId || airport.id} type="button"
                                    onClick={() => { onChange({ target: { name, value: airport.airportId || airport.id } }); setIsOpen(false); setSearch(""); }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 text-sm transition-colors flex items-center justify-between group/item">
                                    <span className="text-gray-700 font-medium">{airport.airportName || airport.name}</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono group-hover/item:bg-white group-hover/item:shadow-sm">
                                        {airport.airportCode || airport.code}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
            {error && <p className="text-red-300 text-xs mt-1 ml-1 font-medium bg-red-900/40 px-2 py-0.5 rounded w-fit backdrop-blur-sm">{error}</p>}
        </div>
    );
}

// Modern Select Box
function SelectBox({ name, value, onChange, disabled, options, placeholder, error, idKey, nameKey }) {
    return (
        <div className="relative">
            <select name={name} value={value} onChange={onChange} disabled={disabled}
                className={`w-full px-4 py-3 border rounded-xl text-sm font-medium bg-white/95 backdrop-blur-sm shadow-sm appearance-none cursor-pointer hover:shadow-md transition-all
                disabled:bg-gray-100/50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none
                focus:ring-2 focus:ring-blue-500/50 focus:outline-none
                ${error ? "border-red-400 ring-1 ring-red-400" : "border-white/20"}`}>
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o[idKey] || o.id} value={o[idKey] || o.id}>{o[nameKey] || o.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                ▼
            </div>
            {error && <p className="text-red-300 text-xs mt-1 ml-1 font-medium bg-red-900/40 px-2 py-0.5 rounded w-fit backdrop-blur-sm">{error}</p>}
        </div>
    );
}

export default function HeroSection() {
    const { t } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    // showLocationError state removed, using toast instead
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
        const error = searchParams.get('error');
        if (error === 'missing_location') {
            toast.error("Please select both pickup and return locations.", {
                toastId: 'missing_location' // Prevent duplicates
            });
            window.history.replaceState({}, '', '/');
        }
    }, [searchParams]);

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
        if (!validateForm()) {
            toast.error("Please fill in all required fields.");
            return;
        }
        let pickupHubId = formData.pickupHubId;
        if (formData.pickupType === "airport") {
            const selectedAirport = pickupAirports.find(a => (a.airportId || a.id) == formData.pickupAirportId);
            pickupHubId = selectedAirport?.hubId || selectedAirport?.hub?.id || "";
        }
        let returnHubId = formData.returnHubId;
        if (formData.returnType === "airport") {
            const selectedAirport = returnAirports.find(a => (a.airportId || a.id) == formData.returnAirportId);
            returnHubId = selectedAirport?.hubId || selectedAirport?.hub?.id || "";
        }
        const params = new URLSearchParams({
            pickupHub: pickupHubId, returnHub: returnHubId,
            pickupDate: `${formData.pickupDate}T${formData.pickupTime}`,
            returnDate: `${formData.returnDate}T${formData.returnTime}`,
        });
        router.push(`/vehicles?${params.toString()}`);
    };

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">

            {/* Background Image with Modern Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent z-10" />
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('/banner.jpg')" }}
                />
            </div>

            {/* Notification Toast - Handled globally by React Toastify */}


            <div className="relative z-20 max-w-7xl mx-auto px-4 w-full py-12 md:py-0">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    {/* Hero Text */}
                    <div className="lg:col-span-5 text-white space-y-6 animate-fade-in-left">
                        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Perfect Drive</span>
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                            Experience the freedom of the road with our premium fleet. Flexible bookings, transparent pricing, and 24/7 support.
                        </p>
                    </div>

                    {/* Search Card - Glassmorphism */}
                    <div className="lg:col-span-1 lg:col-start-7 lg:col-end-13 relative">
                        {/* Background Container (Handles Clipping & Effects) */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
                        </div>

                        {/* Content Container (Allows Dropdown Overflow) */}
                        <div className="relative z-10 p-5 md:p-6">
                            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white flex items-center gap-3">
                                {t('home.hero.title', 'Book Your Journey')}
                            </h2>

                            <div className="space-y-4">
                                {/* PICKUP SECTION */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                            {t('home.hero.pickup', 'Pickup Location')}
                                        </label>
                                        {/* Improved Toggle */}
                                        <div className="flex bg-slate-900/60 rounded-lg p-1 border border-white/10 backdrop-blur-sm">
                                            <button type="button" onClick={() => handleChange({ target: { name: "pickupType", value: "hub" } })}
                                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.pickupType === "hub" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>Hub</button>
                                            <button type="button" onClick={() => handleChange({ target: { name: "pickupType", value: "airport" } })}
                                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.pickupType === "airport" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>Airport</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 relative z-30">
                                        {formData.pickupType === "hub" ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <SelectBox name="stateId" value={formData.stateId} onChange={handleChange} options={states} placeholder="State" error={errors.stateId} idKey="stateId" nameKey="stateName" />
                                                <SelectBox name="cityId" value={formData.cityId} onChange={handleChange} disabled={!formData.stateId} options={cities} placeholder="City" error={errors.cityId} idKey="cityId" nameKey="cityName" />
                                                <SelectBox name="pickupHubId" value={formData.pickupHubId} onChange={handleChange} disabled={!formData.cityId} options={hubs} placeholder="Hub" error={errors.pickupHubId} idKey="hubId" nameKey="hubName" />
                                            </div>
                                        ) : (
                                            <SearchableAirportSelect airports={pickupAirports} value={formData.pickupAirportId} onChange={handleChange} name="pickupAirportId" error={errors.pickupAirportId} placeholder="Search airport name or code..." />
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} min={minDate}
                                                className={`w-full px-4 py-3 bg-white/95 backdrop-blur-sm border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 ${errors.pickupDate ? "border-red-400" : "border-white/20"}`} />
                                            <input type="time" name="pickupTime" value={formData.pickupTime} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900" />
                                        </div>
                                    </div>
                                </div>

                                {/* DIVIDER */}
                                <div className="relative flex items-center justify-center py-2 opacity-50">
                                    <div className="w-full border-t border-white/20"></div>
                                    <span className="absolute bg-slate-900 border border-white/10 text-gray-400 px-3 py-0.5 text-[10px] uppercase tracking-widest rounded-full font-medium">to</span>
                                </div>

                                {/* RETURN SECTION */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-green-200 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                            {t('home.hero.return', 'Return Location')}
                                        </label>
                                        <div className="flex bg-slate-900/60 rounded-lg p-1 border border-white/10 backdrop-blur-sm">
                                            <button type="button" onClick={() => handleChange({ target: { name: "returnType", value: "hub" } })}
                                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.returnType === "hub" ? "bg-green-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>Hub</button>
                                            <button type="button" onClick={() => handleChange({ target: { name: "returnType", value: "airport" } })}
                                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.returnType === "airport" ? "bg-green-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>Airport</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 relative z-20">
                                        {formData.returnType === "hub" ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <SelectBox name="returnStateId" value={formData.returnStateId} onChange={handleChange} options={states} placeholder="State" error={errors.returnStateId} idKey="stateId" nameKey="stateName" />
                                                <SelectBox name="returnCityId" value={formData.returnCityId} onChange={handleChange} disabled={!formData.returnStateId} options={returnCities} placeholder="City" error={errors.returnCityId} idKey="cityId" nameKey="cityName" />
                                                <SelectBox name="returnHubId" value={formData.returnHubId} onChange={handleChange} disabled={!formData.returnCityId} options={returnHubs} placeholder="Hub" error={errors.returnHubId} idKey="hubId" nameKey="hubName" />
                                            </div>
                                        ) : (
                                            <SearchableAirportSelect airports={returnAirports} value={formData.returnAirportId} onChange={handleChange} name="returnAirportId" error={errors.returnAirportId} placeholder="Search airport name or code..." />
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} min={formData.pickupDate || minDate}
                                                className={`w-full px-4 py-3 bg-white/95 backdrop-blur-sm border rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500/50 outline-none text-gray-900 ${errors.returnDate ? "border-red-400" : "border-white/20"}`} />
                                            <input type="time" name="returnTime" value={formData.returnTime} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500/50 outline-none text-gray-900" />
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleSearch} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 transform hover:scale-[1.02] transition-all duration-200 relative z-10">
                                    {t('home.hero.search_btn', 'Find Vehicles')} ➔
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
