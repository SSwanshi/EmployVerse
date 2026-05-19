import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicantApi } from '../services/applicantApi';
import Header from '../components/common/Header';

const ApplyInternship = () => {
    const { internshipId } = useParams();
    const navigate = useNavigate();

    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    const [resumeOption, setResumeOption] = useState('same');
    const [applicationResumeId, setApplicationResumeId] = useState(null);
    const [resumeFileName, setResumeFileName] = useState(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadResumeError, setUploadResumeError] = useState(null);

    useEffect(() => {
        const fetchInternship = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use dedicated check endpoint which also tells us if already applied
                const data = await applicantApi.checkInternshipApplication(internshipId);
                setInternship(data.internship);
                setAlreadyApplied(!!data.alreadyApplied);
            } catch (err) {
                setError(
                    err.response?.data?.error ||
                    'Failed to load internship details. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInternship();
    }, [internshipId]);

    const handleResumeFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !internshipId) return;
        if (file.type !== 'application/pdf') {
            setUploadResumeError('Please upload a PDF file.');
            return;
        }
        setUploadResumeError(null);
        setUploadingResume(true);
        try {
            const data = await applicantApi.uploadInternshipApplicationResume(internshipId, file);
            if (data?.resumeId) {
                setApplicationResumeId(data.resumeId);
                setResumeFileName(file.name);
            } else {
                setUploadResumeError(data?.error || 'Upload failed.');
            }
        } catch (err) {
            setUploadResumeError(err.response?.data?.error || 'Failed to upload resume.');
        } finally {
            setUploadingResume(false);
        }
    };

    const handleApply = async () => {
        if (!internshipId || submitting || alreadyApplied) return;

        if (resumeOption === 'specific' && !applicationResumeId) {
            setError('Please upload an internship-specific resume first.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const resumeId = resumeOption === 'specific' ? applicationResumeId : null;
            const response = await applicantApi.applyForInternship(internshipId, resumeId);

            if (response?.success) {
                setToastVisible(true);
                setAlreadyApplied(true);
                setTimeout(() => {
                    setToastVisible(false);
                }, 3000);
            }
        } catch (err) {
            const message =
                err.response?.data?.error || 'Failed to submit application.';
            setError(message);

            if (message.toLowerCase().includes('already applied')) {
                setAlreadyApplied(true);
            }

            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const companyName =
        internship?.intCompany?.companyName || 'Company Not Available';
    const logoUrl = internship?.intCompany?.logoId
        ? applicantApi.getLogo(internship.intCompany.logoId)
        : null;
    const requirements = internship?.intRequirements
        ? internship.intRequirements.split('\n').filter(Boolean)
        : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading internship details...
            </div>
        );
    }

    if (error && !internship) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
                <p className="text-lg text-red-600 mb-4">{error}</p>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header title="Apply for Internship" />

            <div className="min-h-screen pt-8 pb-10 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-4">
                    {/* Company Header Section */}
                    <div className="bg-blue-50 p-6 flex items-center space-x-4 border-b border-gray-200">
                        <div className="flex-shrink-0">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt={companyName}
                                    className="h-16 w-16 rounded-lg object-contain border border-gray-200"
                                />
                            ) : (
                                <div className="h-16 w-16 bg-gray-300 rounded-lg flex items-center justify-center border border-gray-200">
                                    <span className="text-gray-500 text-sm font-bold">N/A</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {internship?.intTitle || 'Internship Title'}
                            </h1>
                            <div className="flex items-center mt-1 flex-wrap gap-2">
                                <span className="text-lg font-medium text-blue-600">
                                    {companyName}
                                </span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="flex items-center text-gray-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    {internship?.intLocation}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Internship Details Section */}
                    <div className="p-6 md:p-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="md:col-span-2">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Internship Description
                                </h2>
                                <div className="prose max-w-none text-gray-700 mb-6 whitespace-pre-line">
                                    {internship?.intDescription}
                                </div>

                                {requirements.length > 0 && (
                                    <>
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                            Requirements
                                        </h2>
                                        <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                                            {requirements.map((req, index) => (
                                                <li key={index}>{req.trim()}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>

                            {/* Sidebar with Key Info */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Internship Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-blue-500 mt-0.5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-gray-500">Duration</p>
                                                <p className="font-medium">
                                                    {internship?.intDuration} months
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-blue-500 mt-0.5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-gray-500">Stipend</p>
                                                <p className="font-medium">
                                                    ₹{internship?.intStipend || internship?.intStipned}
                                                    per month
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-blue-500 mt-0.5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Experience Required
                                                </p>
                                                <p className="font-medium">
                                                    {internship?.intExperience} years
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-blue-500 mt-0.5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-gray-500">Open Positions</p>
                                                <p className="font-medium">
                                                    {internship?.intPositions}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Resume selection */}
                                {!alreadyApplied && (
                                    <div className="bg-gray-50 rounded-lg p-5 mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                            Resume for this application
                                        </h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="resumeOption"
                                                    checked={resumeOption === 'same'}
                                                    onChange={() => {
                                                        setResumeOption('same');
                                                        setUploadResumeError(null);
                                                    }}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span>Use my default resume</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="resumeOption"
                                                    checked={resumeOption === 'specific'}
                                                    onChange={() => {
                                                        setResumeOption('specific');
                                                        setUploadResumeError(null);
                                                    }}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span>Use an internship-specific resume</span>
                                            </label>
                                            {resumeOption === 'specific' && (
                                                <div className="mt-3 pl-6 space-y-2">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,application/pdf"
                                                        onChange={handleResumeFileChange}
                                                        disabled={uploadingResume}
                                                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    {uploadingResume && (
                                                        <p className="text-sm text-gray-500">Uploading...</p>
                                                    )}
                                                    {resumeFileName && !uploadingResume && (
                                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Uploaded: {resumeFileName}
                                                        </p>
                                                    )}
                                                    {uploadResumeError && (
                                                        <p className="text-sm text-red-600">{uploadResumeError}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Apply Button */}
                                <button
                                    type="button"
                                    onClick={handleApply}
                                    disabled={submitting || alreadyApplied || (resumeOption === 'specific' && !applicationResumeId)}
                                    className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center ${alreadyApplied
                                        ? 'bg-green-400 text-green-900 cursor-not-allowed'
                                        : 'bg-yellow-400 hover:bg-yellow-500 text-blue-800'
                                        }`}
                                >
                                    {alreadyApplied ? 'Applied Successfully!!' : 'Apply Now'}
                                    {!alreadyApplied && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 ml-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    )}
                                </button>

                                {error && (
                                    <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <div
                className={`fixed top-24 right-4 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 z-50 ${toastVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-4 pointer-events-none'
                    }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
                <span>Application submitted successfully!</span>
            </div>
        </div>
    );
};

export default ApplyInternship;


