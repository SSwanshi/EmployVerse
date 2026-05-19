import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';

const CompanyForm = ({ initialValues, onSubmit, isSubmitting, submitButtonText = "Submit", showProofDocument = true }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Validation schema
  const validationSchema = Yup.object({
    companyName: Yup.string()
      .required('Company name is required')
      .min(2, 'Company name must be at least 2 characters')
      .max(100, 'Company name must be less than 100 characters')
      .matches(/^[A-Za-z\s]+$/, 'Company name should contain only alphabets'),
    website: Yup.string()
      .required('Website is required')
      .test('is-valid-url', 'Please enter a valid website URL (e.g., https://www.example.com)', (value) => {
        if (!value) return false;
        try {
          const url = new URL(value);
          // Check for valid protocols
          return ['http:', 'https:'].includes(url.protocol);
        } catch {
          // If URL constructor fails, try regex validation
          const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
          return urlRegex.test(value);
        }
      })
      .test('no-invalid-chars', 'Please enter a valid website URL', (value) => {
        if (!value) return false;
        // Reject URLs with suspicious patterns
        if (value.includes('..')) {
          return false;
        }
        // Reject URLs with // that don't start with http:// or https://
        if (value.includes('//') && !value.startsWith('http://') && !value.startsWith('https://')) {
          return false;
        }
        return true;
      }),
    location: Yup.string()
      .required('Location is required')
      .min(2, 'Location must be at least 2 characters')
      .max(200, 'Location must be less than 200 characters')
      .matches(/^[A-Za-z\s,]+$/, 'Location should contain only alphabets, spaces, and commas'),
    logo: Yup.mixed()
      .nullable()
      .test('fileSize', 'Logo file size must be less than 5MB', (value) => {
        if (!value) return true; // Optional field
        return value.size <= 5 * 1024 * 1024;
      })
      .test('fileType', 'Logo must be an image file (jpg, jpeg, png, gif)', (value) => {
        if (!value) return true; // Optional field
        return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(value.type);
      }),
    proofDocument: showProofDocument
      ? Yup.mixed()
          .required('Proof document is required')
          .test('fileSize', 'Proof document file size must be less than 10MB', (value) => {
            if (!value) return false;
            return value.size <= 10 * 1024 * 1024;
          })
          .test('fileType', 'Proof document must be a PDF, JPG, or PNG file', (value) => {
            if (!value) return false;
            return ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(value.type);
          })
      : Yup.mixed().nullable(),
  });

  // Default initial values
  const defaultValues = {
    companyName: '',
    website: '',
    location: '',
    logo: null,
    proofDocument: null,
    ...initialValues,
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      await onSubmit(values, setSubmitting);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {({ setFieldValue, setFieldTouched, values, errors, touched }) => (
        <Form className="space-y-6">
          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-semibold text-blue-800 mb-1"
            >
              Company Name <span className="text-yellow-500">*</span>
            </label>
            <Field
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Enter company name"
              onKeyPress={(e) => {
                // Only allow alphabets and spaces
                const char = String.fromCharCode(e.which);
                if (!/[A-Za-z\s]/.test(char)) {
                  e.preventDefault();
                }
              }}
              className={`mt-1 w-full rounded-md border ${
                errors.companyName && touched.companyName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              } p-2 focus:outline-none focus:ring-2`}
            />
            <ErrorMessage
              name="companyName"
              component="div"
              className="mt-1 text-sm text-red-600"
            />
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="website"
              className="block text-sm font-semibold text-blue-800 mb-1"
            >
              Website <span className="text-yellow-500">*</span>
            </label>
            <Field
              id="website"
              name="website"
              type="url"
              placeholder="https://www.example.com"
              className={`mt-1 w-full rounded-md border ${
                errors.website && touched.website
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              } p-2 focus:outline-none focus:ring-2`}
            />
            <ErrorMessage
              name="website"
              component="div"
              className="mt-1 text-sm text-red-600"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-blue-800 mb-1"
            >
              Location <span className="text-yellow-500">*</span>
            </label>
            <Field
              id="location"
              name="location"
              type="text"
              placeholder="Enter company location (e.g., City, State, Country)"
              onKeyPress={(e) => {
                // Only allow alphabets, spaces, and commas
                const char = String.fromCharCode(e.which);
                if (!/[A-Za-z\s,]/.test(char)) {
                  e.preventDefault();
                }
              }}
              className={`mt-1 w-full rounded-md border ${
                errors.location && touched.location
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              } p-2 focus:outline-none focus:ring-2`}
            />
            <ErrorMessage
              name="location"
              component="div"
              className="mt-1 text-sm text-red-600"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label
              htmlFor="logo"
              className="block text-sm font-semibold text-blue-800 mb-1"
            >
              Company Logo
              <span className="text-gray-500 text-xs font-normal ml-2">
                (Optional - JPG, PNG, GIF, max 5MB)
              </span>
            </label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={(event) => {
                const file = event.currentTarget.files[0];
                setFieldValue('logo', file);
              }}
              className={`mt-1 w-full rounded-md border ${
                errors.logo && touched.logo
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              } p-2 focus:outline-none focus:ring-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
            />
            {values.logo && (
              <p className="mt-1 text-sm text-gray-600">
                Selected: {values.logo.name}
              </p>
            )}
            <ErrorMessage
              name="logo"
              component="div"
              className="mt-1 text-sm text-red-600"
            />
          </div>

          {/* Proof Document Upload */}
          {showProofDocument && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label
                  htmlFor="proofDocument"
                  className="block text-sm font-semibold text-blue-800"
                >
                  Proof Document <span className="text-yellow-500">*</span>
                  <span className="text-gray-500 text-xs font-normal ml-2">
                    (PDF, JPG, PNG, max 10MB)
                  </span>
                </label>
                <div className="relative group">
                  <button
                    type="button"
                    className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center text-xs font-bold cursor-help transition-colors"
                    aria-label="Information about proof document"
                  >
                    i
                  </button>
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
                    This document is required as a proof whether this company is registered or not and you belong to this company
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <input
                id="proofDocument"
                name="proofDocument"
                type="file"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                onChange={(event) => {
                  const file = event.currentTarget.files[0];
                  setFieldValue('proofDocument', file);
                  setFieldTouched('proofDocument', true);
                  
                  // Create preview URL
                  if (file) {
                    // Clean up previous preview URL
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                  } else {
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                  }
                }}
                onBlur={() => {
                  setFieldTouched('proofDocument', true);
                }}
                className={`mt-1 w-full rounded-md border ${
                  errors.proofDocument && touched.proofDocument
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-blue-300 focus:ring-blue-500'
                } p-2 focus:outline-none focus:ring-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              />
              {values.proofDocument && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected: {values.proofDocument.name}
                  </p>
                  {previewUrl && (
                    <div className="mt-3 border border-gray-300 rounded-lg overflow-hidden">
                      {values.proofDocument.type === 'application/pdf' ? (
                        <iframe
                          src={previewUrl}
                          className="w-full h-96"
                          title="PDF Preview"
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Document Preview"
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
              <ErrorMessage
                name="proofDocument"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : submitButtonText}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default CompanyForm;

