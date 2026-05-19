import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const JobForm = ({ initialValues, onSubmit, isSubmitting, submitButtonText = "Submit", companies = [] }) => {
  // Validation schema
  const validationSchema = Yup.object({
    jobTitle: Yup.string()
      .required('Job title is required')
      .min(3, 'Job title must be at least 3 characters')
      .max(100, 'Job title must be less than 100 characters')
      .matches(/^[A-Za-z\s]+$/, 'Job title should contain only alphabets'),
    jobDescription: Yup.string()
      .required('Job description is required')
      .min(10, 'Job description must be at least 10 characters')
      .max(5000, 'Job description must be less than 5000 characters'),
    jobRequirements: Yup.string()
      .required('Job requirements are required')
      .min(10, 'Job requirements must be at least 10 characters')
      .max(2000, 'Job requirements must be less than 2000 characters'),
    jobSalary: Yup.string()
      .required('Salary is required')
      .matches(/^\d+$/, 'Salary must contain only digits')
      .test('positive', 'Salary must be a positive number', (value) => {
        if (!value) return false;
        const num = parseInt(value, 10);
        return num > 0;
      }),
    jobLocation: Yup.string()
      .required('Job location is required')
      .min(2, 'Job location must be at least 2 characters')
      .max(200, 'Job location must be less than 200 characters')
      .matches(/^[A-Za-z\s,]+$/, 'Location should contain only alphabets, spaces, and commas'),
    jobType: Yup.string()
      .required('Job type is required')
      .oneOf(['Full-Time', 'Part-Time', 'Internship'], 'Please select a valid job type'),
    jobExperience: Yup.string()
      .required('Experience is required')
      .matches(/^\d+$/, 'Experience must contain only digits')
      .test('valid-range', 'Experience must be between 0 and 50 years', (value) => {
        if (!value) return false;
        const num = parseInt(value, 10);
        return num >= 0 && num <= 50;
      }),
    noofPositions: Yup.string()
      .required('Number of positions is required')
      .matches(/^\d+$/, 'Number of positions must contain only digits')
      .test('min-positions', 'At least 1 position is required', (value) => {
        if (!value) return false;
        const num = parseInt(value, 10);
        return num >= 1;
      })
      .test('max-positions', 'Number of positions must be less than 1000', (value) => {
        if (!value) return false;
        const num = parseInt(value, 10);
        return num <= 1000;
      }),
    jobCompany: Yup.string()
      .required('Company is required')
      .test('verified-company', 'Please select a verified company', (value) => {
        if (!value) return false;
        const company = companies.find(c => c._id === value);
        return company && company.verified === true;
      }),
    jobExpiry: Yup.date()
      .required('Job expiry date is required')
      .min(new Date(), 'Job expiry date must be in the future'),
  });

  // Calculate default expiry date (30 days from now)
  const getDefaultExpiryDate = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate.toISOString().split('T')[0];
  };

  // Default initial values
  const defaultValues = {
    jobTitle: '',
    jobDescription: '',
    jobRequirements: '',
    jobSalary: '',
    jobLocation: '',
    jobType: '',
    jobExperience: '',
    noofPositions: '',
    jobCompany: '',
    jobExpiry: initialValues?.jobExpiry || getDefaultExpiryDate(),
    ...initialValues,
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      await onSubmit(values, setSubmitting);
    } catch  {
      setSubmitting(false);
    }
  };

  // Filter verified companies for dropdown
  const verifiedCompanies = companies.filter(company => company.verified === true);

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {({ errors, touched, setFieldValue }) => (
        <Form className="space-y-6">
          {/* Job Title */}
          <div>
            <label
              htmlFor="jobTitle"
              className="block text-sm font-semibold text-blue-800 mb-1"
            >
              Job Title <span className="text-yellow-500">*</span>
            </label>
            <Field
              id="jobTitle"
              name="jobTitle"
              type="text"
              placeholder="e.g., Software Engineer, Marketing Manager"
              onKeyPress={(e) => {
                const char = String.fromCharCode(e.which);
                if (!/[A-Za-z\s]/.test(char)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                setFieldValue('jobTitle', value);
              }}
              className={`mt-1 w-full rounded-md border ${
                errors.jobTitle && touched.jobTitle
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              } p-2 focus:outline-none focus:ring-2`}
            />
            <ErrorMessage
              name="jobTitle"
              component="div"
              className="mt-1 text-sm text-red-600"
            />
          </div>

          {/* Company Selection */}
          <div>
            <label
              htmlFor="jobCompany"
              className="block text-sm font-semibold text-blue-800 mb-1"
            >
              Company <span className="text-yellow-500">*</span>
            </label>
            <Field
              as="select"
              id="jobCompany"
              name="jobCompany"
              className={`mt-1 w-full rounded-md border ${
                errors.jobCompany && touched.jobCompany
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              } p-2 focus:outline-none focus:ring-2`}
            >
              <option value="">Select a company</option>
              {verifiedCompanies.length === 0 ? (
                <option value="" disabled>
                  No verified companies available. Please add and verify a company first.
                </option>
              ) : (
                verifiedCompanies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.companyName}
                  </option>
                ))
              )}
            </Field>
            <ErrorMessage
              name="jobCompany"
              component="div"
              className="mt-1 text-sm text-red-600"
            />
            {verifiedCompanies.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                You need at least one verified company to post a job.
              </p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label
              htmlFor="jobDescription"
              className="block text-sm font-semibold text-blue-800 mb-1"
            >
              Job Description <span className="text-yellow-500">*</span>
            </label>
            <Field
              as="textarea"
              id="jobDescription"
              name="jobDescription"
              rows="5"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className={`mt-1 w-full rounded-md border ${
                errors.jobDescription && touched.jobDescription
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              } p-2 focus:outline-none focus:ring-2 resize-vertical`}
            />
            <ErrorMessage
              name="jobDescription"
              component="div"
              className="mt-1 text-sm text-red-600"
            />
          </div>

          {/* Job Requirements */}
          <div>
            <label
              htmlFor="jobRequirements"
              className="block text-sm font-semibold text-blue-800 mb-1"
            >
              Job Requirements <span className="text-yellow-500">*</span>
            </label>
            <Field
              as="textarea"
              id="jobRequirements"
              name="jobRequirements"
              rows="4"
              placeholder="List the required skills, qualifications, and experience..."
              className={`mt-1 w-full rounded-md border ${
                errors.jobRequirements && touched.jobRequirements
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              } p-2 focus:outline-none focus:ring-2 resize-vertical`}
            />
            <ErrorMessage
              name="jobRequirements"
              component="div"
              className="mt-1 text-sm text-red-600"
            />
          </div>

          {/* Salary and Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Salary */}
            <div>
              <label
                htmlFor="jobSalary"
                className="block text-sm font-semibold text-blue-800 mb-1"
              >
                Salary (in LPA) <span className="text-yellow-500">*</span>
              </label>
              <Field
                id="jobSalary"
                name="jobSalary"
                type="text"
                placeholder="e.g., 50000"
                onKeyPress={(e) => {
                  // Only allow digits
                  const char = String.fromCharCode(e.which);
                  if (!/[0-9]/.test(char)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFieldValue('jobSalary', value);
                }}
                className={`mt-1 w-full rounded-md border ${
                  errors.jobSalary && touched.jobSalary
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-blue-300 focus:ring-blue-500'
                } p-2 focus:outline-none focus:ring-2`}
              />
              <ErrorMessage
                name="jobSalary"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="jobLocation"
                className="block text-sm font-semibold text-blue-800 mb-1"
              >
                Job Location <span className="text-yellow-500">*</span>
              </label>
              <Field
                id="jobLocation"
                name="jobLocation"
                type="text"
                placeholder="e.g., Mumbai, Remote, Hybrid"
                onKeyPress={(e) => {
                  // Only allow alphabets, spaces, and commas
                  const char = String.fromCharCode(e.which);
                  if (!/[A-Za-z\s,]/.test(char)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  // Only allow alphabets, spaces, and commas
                  const value = e.target.value.replace(/[^A-Za-z\s,]/g, '');
                  setFieldValue('jobLocation', value);
                }}
                className={`mt-1 w-full rounded-md border ${
                  errors.jobLocation && touched.jobLocation
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-blue-300 focus:ring-blue-500'
                } p-2 focus:outline-none focus:ring-2`}
              />
              <ErrorMessage
                name="jobLocation"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>
          </div>

          {/* Job Type and Experience Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Type */}
            <div>
              <label
                htmlFor="jobType"
                className="block text-sm font-semibold text-blue-800 mb-1"
              >
                Job Type <span className="text-yellow-500">*</span>
              </label>
              <Field
                as="select"
                id="jobType"
                name="jobType"
                className={`mt-1 w-full rounded-md border ${
                  errors.jobType && touched.jobType
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-blue-300 focus:ring-blue-500'
                } p-2 focus:outline-none focus:ring-2`}
              >
                <option value="">Select job type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
              </Field>
              <ErrorMessage
                name="jobType"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            {/* Experience */}
            <div>
              <label
                htmlFor="jobExperience"
                className="block text-sm font-semibold text-blue-800 mb-1"
              >
                Experience (Years) <span className="text-yellow-500">*</span>
              </label>
              <Field
                id="jobExperience"
                name="jobExperience"
                type="text"
                placeholder="e.g., 2"
                onKeyPress={(e) => {
                  // Only allow digits
                  const char = String.fromCharCode(e.which);
                  if (!/[0-9]/.test(char)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFieldValue('jobExperience', value);
                }}
                className={`mt-1 w-full rounded-md border ${
                  errors.jobExperience && touched.jobExperience
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-blue-300 focus:ring-blue-500'
                } p-2 focus:outline-none focus:ring-2`}
              />
              <ErrorMessage
                name="jobExperience"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>
          </div>

          {/* Number of Positions and Expiry Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Number of Positions */}
            <div>
              <label
                htmlFor="noofPositions"
                className="block text-sm font-semibold text-blue-800 mb-1"
              >
                Number of Positions <span className="text-yellow-500">*</span>
              </label>
              <Field
                id="noofPositions"
                name="noofPositions"
                type="text"
                placeholder="e.g., 5"
                onKeyPress={(e) => {
                  // Only allow digits
                  const char = String.fromCharCode(e.which);
                  if (!/[0-9]/.test(char)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFieldValue('noofPositions', value);
                }}
                className={`mt-1 w-full rounded-md border ${
                  errors.noofPositions && touched.noofPositions
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-blue-300 focus:ring-blue-500'
                } p-2 focus:outline-none focus:ring-2`}
              />
              <ErrorMessage
                name="noofPositions"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            {/* Job Expiry Date */}
            <div>
              <label
                htmlFor="jobExpiry"
                className="block text-sm font-semibold text-blue-800 mb-1"
              >
                Job Expiry Date <span className="text-yellow-500">*</span>
              </label>
              <Field
                id="jobExpiry"
                name="jobExpiry"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`mt-1 w-full rounded-md border ${
                  errors.jobExpiry && touched.jobExpiry
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-blue-300 focus:ring-blue-500'
                } p-2 focus:outline-none focus:ring-2`}
              />
              <ErrorMessage
                name="jobExpiry"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || verifiedCompanies.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : submitButtonText}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default JobForm;

