"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
// NOTE: Make sure getAllCities is exported from your service, or create it.
import {
  getAllStates,
  getCitiesByState,
  getHubsByCity,
} from "../services/locationService";

export default function Home() {
  const router = useRouter();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [allCities, setAllCities] = useState([]); // New state for Drop Location
  const [hubs, setHubs] = useState([]);

  // Added errors state for validation
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    stateId: "",
    cityId: "",
    pickupHubId: "",
    dropCityId: "", // Changed from dropHubId to dropCityId
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStates();
    fetchAllCities(); // Fetch all cities for the drop dropdown
  }, []);

  useEffect(() => {
    if (formData.stateId) {
      fetchCities(formData.stateId);
    }
  }, [formData.stateId]);

  useEffect(() => {
    if (formData.cityId) {
      fetchHubs(formData.cityId);
    }
  }, [formData.cityId]);

  const fetchStates = async () => {
    try {
      const response = await getAllStates();
      setStates(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  // New function to get all cities for Drop Location
  const fetchAllCities = async () => {
    try {
      // Ensure this API method exists in your service
      const response = await getAllCities();
      setAllCities(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Error fetching all cities:", error);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const response = await getCitiesByState(stateId);
      setCities(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchHubs = async (cityId) => {
    try {
      const response = await getHubsByCity(cityId);
      setHubs(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types/selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Reset dependent fields
    if (name === "stateId") {
      setFormData((prev) => ({ ...prev, cityId: "", pickupHubId: "" })); // Removed drop reset as it's independent now
      setCities([]);
      setHubs([]);
    }
    if (name === "cityId") {
      setFormData((prev) => ({ ...prev, pickupHubId: "" }));
      setHubs([]);
    }
  };

  // New Validation Function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.stateId) newErrors.stateId = "State is required";
    if (!formData.cityId) newErrors.cityId = "City is required";
    if (!formData.pickupHubId)
      newErrors.pickupHubId = "Pickup location is required";
    if (!formData.dropCityId)
      newErrors.dropCityId = "Drop location is required";
    if (!formData.pickupDate) newErrors.pickupDate = "Pickup date is required";
    if (!formData.returnDate) newErrors.returnDate = "Return date is required";

    if (formData.pickupDate && formData.returnDate) {
      if (new Date(formData.returnDate) < new Date(formData.pickupDate)) {
        newErrors.returnDate = "Return date cannot be before pickup date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    if (!validateForm()) {
      // Stop if validation fails
      return;
    }

    // Navigate to vehicles page with search params
    const params = new URLSearchParams({
      pickupHub: formData.pickupHubId,
      dropCity: formData.dropCityId, // Sending dropCity instead of dropHub
      pickupDate: `${formData.pickupDate}T${formData.pickupTime}`,
      returnDate: `${formData.returnDate}T${formData.returnTime}`,
    });
    router.push(`/vehicles?${params.toString()}`);
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <>
      <Navbar />

      {/* Hero Section with Background Image */}
      <section
        className="relative w-full bg-fit bg-center bg-no-repeat text-white max-h-[600px]"
        style={{ backgroundImage: "url('/banner.png')" }} // Make sure the filename is correct
      >       

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-3">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Column - Leave empty to push the form to the right */}
            <div></div>

            {/* Right - form */}

            <Card className="p-6 bg-white/95 backdrop-blur text-gray-900 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Find Your Perfect Ride
              </h2>

              <div className="space-y-4">
                {/* State Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    name="stateId"
                    value={formData.stateId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.stateId ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option
                        key={state.stateId || state.id}
                        value={state.stateId || state.id}
                      >
                        {state.stateName || state.name}
                      </option>
                    ))}
                  </select>
                  {errors.stateId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.stateId}
                    </p>
                  )}
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    name="cityId"
                    value={formData.cityId}
                    onChange={handleChange}
                    disabled={!formData.stateId}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${errors.cityId ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option
                        key={city.cityId || city.id}
                        value={city.cityId || city.id}
                      >
                        {city.cityName || city.name}
                      </option>
                    ))}
                  </select>
                  {errors.cityId && (
                    <p className="text-red-500 text-xs mt-1">{errors.cityId}</p>
                  )}
                </div>

                {/* Pickup and Drop Location Row - NOW SIDE BY SIDE */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Pickup Hub */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Location
                    </label>
                    <select
                      name="pickupHubId"
                      value={formData.pickupHubId}
                      onChange={handleChange}
                      disabled={!formData.cityId}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${errors.pickupHubId ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select Pickup Hub</option>
                      {hubs.map((hub) => (
                        <option
                          key={hub.hubId || hub.id}
                          value={hub.hubId || hub.id}
                        >
                          {hub.hubName || hub.name}
                        </option>
                      ))}
                    </select>
                    {errors.pickupHubId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pickupHubId}
                      </p>
                    )}
                  </div>

                  {/* Drop Location - Showing CITIES now */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drop Location
                    </label>
                    <select
                      name="dropCityId"
                      value={formData.dropCityId}
                      onChange={handleChange}
                      // Removed disabled check so it can be selected independently
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dropCityId ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select Drop City</option>
                      {/* Assuming allCities contains the full list of cities available for dropoff */}
                      {hubs.map((city) => (
                        <option
                          key={city.cityId || city.id}
                          value={city.cityId || city.id}
                        >
                          {city.cityName || city.name}
                        </option>
                      ))}
                    </select>
                    {errors.dropCityId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.dropCityId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      min={minDate}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.pickupDate ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.pickupDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pickupDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleChange}
                      min={formData.pickupDate || minDate}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.returnDate ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.returnDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.returnDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      name="returnTime"
                      value={formData.returnTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <Button onClick={handleSearch} className="w-full" size="lg">
                  Search Available Vehicles
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FLEMAN?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the best vehicle rental experience with transparent
              pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Transparent Pricing
              </h3>
              <p className="text-gray-600">
                No hidden charges. Daily, weekly, and monthly rates clearly
                displayed.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Easy Booking
              </h3>
              <p className="text-gray-600">
                Book your vehicle in minutes with instant confirmation.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Multiple Locations
              </h3>
              <p className="text-gray-600">
                Pick up and drop off at any of our hubs across major cities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Hit the Road?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of happy customers who trust FLEMAN.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
