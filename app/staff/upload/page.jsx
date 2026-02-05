'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';


export default function UploadLocationsPage() {
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const inputRef = useRef(null);

    // Allowed file types
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
    ];

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        setMessage({ type: '', text: '' });

        if (validTypes.includes(selectedFile.type) ||
            selectedFile.name.endsWith('.csv') ||
            selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
        } else {
            setMessage({ type: 'error', text: 'Invalid file type. Please upload a CSV or Excel file.' });
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Replace with your actual API_BASE_URL if needed
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

            // Get token from storage
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/api/locations/upload`, {
                method: 'POST',
                headers: headers,
                body: formData,
                // Do NOT set Content-Type header manually when sending FormData
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'File uploaded successfully!' });
                setFile(null); // Reset file after success
                // Optional: Redirect after delay
                // setTimeout(() => router.push('/staff/locations'), 2000);
            } else {
                const errorData = await response.text();
                setMessage({ type: 'error', text: `Upload failed: ${errorData || 'Unknown error'}` });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    const triggerFileSelect = () => {
        inputRef.current.click();
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Upload Locations</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Bulk upload hubs and cities for <span className="font-medium text-gray-900">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </p>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Card className="w-full max-w-3xl border border-gray-200 shadow-sm bg-white p-8">
                        {/* Drag and Drop Area */}
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ease-in-out cursor-pointer
                                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                            `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={triggerFileSelect}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleChange}
                            />

                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className={`p-4 rounded-full ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-lg font-medium text-gray-700">
                                        {file ? file.name : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {file ? `${(file.size / 1024).toFixed(2)} KB` : "Excel or CSV files only"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {message.text && (
                            <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                <span>{message.type === 'error' ? '⚠️' : '✅'}</span>
                                <p>{message.text}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex justify-end gap-4">
                            <Button
                                variant="secondary"
                                onClick={() => router.back()}
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="min-w-[120px]"
                            >
                                {uploading ? (
                                    <div className="flex items-center gap-2">
                                        <Spinner size="sm" color="white" />
                                        <span>Uploading...</span>
                                    </div>
                                ) : (
                                    'Upload File'
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}