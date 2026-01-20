"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistrationPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        phoneHome: "",
        phoneCell: "",
        addressLine1: "",
        cityId: "",
        zipcode: "",
        drivingLicenseNo: "",
        licenseIssuedBy: "",
        licenseValidTill: "",
        passportNo: "",
        passportIssuedBy: "",
        passportValidTill: "",
        vehicleTypeId: "",
        dipNumber: "",
        dipIssuedBy: "",
        dipValidTill: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const cities = [
        { id: 1, name: "Mumbai" },
        { id: 2, name: "Delhi" },
        { id: 3, name: "Bangalore" },
        { id: 4, name: "Chennai" },
        { id: 5, name: "Hyderabad" },
    ];

    const vehicleTypes = [
        { id: 1, name: "Sedan" },
        { id: 2, name: "SUV" },
        { id: 3, name: "Truck" },
        { id: 4, name: "Van" },
        { id: 5, name: "Bus" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = "Required";
        if (!formData.phoneCell.trim()) newErrors.phoneCell = "Required";
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Required";
        if (!formData.cityId) newErrors.cityId = "Required";
        if (!formData.drivingLicenseNo.trim()) newErrors.drivingLicenseNo = "Required";
        if (!formData.licenseValidTill) newErrors.licenseValidTill = "Required";
        if (!formData.vehicleTypeId) newErrors.vehicleTypeId = "Required";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        alert("Registration successful!");
    };

    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500";
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const errorStyle = "text-red-500 text-xs mt-1";

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-center mb-6">Driver Registration</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="border border-gray-200 rounded p-4">
                        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>First Name *</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputStyle} />
                                {errors.firstName && <p className={errorStyle}>{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Date of Birth</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Home Phone</label>
                                <input type="tel" name="phoneHome" value={formData.phoneHome} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Cell Phone *</label>
                                <input type="tel" name="phoneCell" value={formData.phoneCell} onChange={handleChange} className={inputStyle} />
                                {errors.phoneCell && <p className={errorStyle}>{errors.phoneCell}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="border border-gray-200 rounded p-4">
                        <h2 className="text-lg font-semibold mb-4">Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={labelStyle}>Address Line 1 *</label>
                                <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className={inputStyle} />
                                {errors.addressLine1 && <p className={errorStyle}>{errors.addressLine1}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>City *</label>
                                <select name="cityId" value={formData.cityId} onChange={handleChange} className={inputStyle}>
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                                {errors.cityId && <p className={errorStyle}>{errors.cityId}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Zipcode</label>
                                <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Driving License */}
                    <div className="border border-gray-200 rounded p-4">
                        <h2 className="text-lg font-semibold mb-4">Driving License</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelStyle}>License Number *</label>
                                <input type="text" name="drivingLicenseNo" value={formData.drivingLicenseNo} onChange={handleChange} className={inputStyle} />
                                {errors.drivingLicenseNo && <p className={errorStyle}>{errors.drivingLicenseNo}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Issued By</label>
                                <input type="text" name="licenseIssuedBy" value={formData.licenseIssuedBy} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Valid Till *</label>
                                <input type="date" name="licenseValidTill" value={formData.licenseValidTill} onChange={handleChange} className={inputStyle} />
                                {errors.licenseValidTill && <p className={errorStyle}>{errors.licenseValidTill}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Passport */}
                    <div className="border border-gray-200 rounded p-4">
                        <h2 className="text-lg font-semibold mb-4">Passport (Optional)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelStyle}>Passport Number</label>
                                <input type="text" name="passportNo" value={formData.passportNo} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Issued By</label>
                                <input type="text" name="passportIssuedBy" value={formData.passportIssuedBy} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Valid Till</label>
                                <input type="date" name="passportValidTill" value={formData.passportValidTill} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle & DIP */}
                    <div className="border border-gray-200 rounded p-4">
                        <h2 className="text-lg font-semibold mb-4">Vehicle & DIP</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Vehicle Type *</label>
                                <select name="vehicleTypeId" value={formData.vehicleTypeId} onChange={handleChange} className={inputStyle}>
                                    <option value="">Select Vehicle Type</option>
                                    {vehicleTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                {errors.vehicleTypeId && <p className={errorStyle}>{errors.vehicleTypeId}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>DIP Number</label>
                                <input type="number" name="dipNumber" value={formData.dipNumber} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>DIP Issued By</label>
                                <input type="text" name="dipIssuedBy" value={formData.dipIssuedBy} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>DIP Valid Till</label>
                                <input type="date" name="dipValidTill" value={formData.dipValidTill} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isLoading ? "Registering..." : "Register"}
                        </button>
                    </div>
                </form>

                <p className="text-center text-gray-600 mt-4">
                    Already registered? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
