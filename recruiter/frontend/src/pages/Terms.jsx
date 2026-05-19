const TermsRecruiter = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-10">

        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Terms of Service (Recruiters)
        </h1>

        <p className="text-gray-700 mb-4">
          These Terms of Service (“Terms”) govern your use of the GoHire platform as a 
          recruiter or employer. By creating an account, posting jobs, or interacting 
          with applicants, you agree to be bound by these Terms. If you do not agree, 
          please discontinue using the platform immediately.
        </p>

        {/* 1. Eligibility */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          1. Eligibility
        </h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>You must be an authorized representative of a company or organization.</li>
          <li>You must provide accurate company information.</li>
          <li>You must comply with all applicable hiring and employment laws.</li>
        </ul>

        {/* 2. Recruiter Responsibilities */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          2. Recruiter Responsibilities
        </h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>Ensure job postings are accurate, lawful, and not misleading.</li>
          <li>Avoid posting fraudulent, spam, or duplicate job listings.</li>
          <li>Respond to applicants professionally and respectfully.</li>
          <li>Maintain confidentiality of applicant information.</li>
        </ul>

        {/* 3. Allowed Platform Use */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          3. Use of the Platform
        </h2>
        <p className="text-gray-700 mb-4">
          Recruiters may use GoHire to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>Create and manage company profiles</li>
          <li>Post jobs, internships, and projects</li>
          <li>Search and review applicant profiles</li>
          <li>Communicate with applicants using approved channels</li>
        </ul>

        <p className="text-gray-700 mb-4">
          Recruiters may NOT:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>Collect applicant data for non-hiring purposes</li>
          <li>Use third-party tools to scrape or mine data</li>
          <li>Discriminate against applicants based on protected characteristics</li>
          <li>Spam, harass, or exploit applicants</li>
        </ul>

        {/* 4. Job Posting Guidelines */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          4. Job Posting Guidelines
        </h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>Posts must include valid job titles, descriptions, and requirements.</li>
          <li>Salary/stipend information should be honest and transparent.</li>
          <li>No multi-level marketing, scams, or misleading opportunities.</li>
          <li>Posts must comply with labor laws and hiring guidelines.</li>
        </ul>

        {/* 5. Applicant Data Usage */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          5. Applicant Data Usage
        </h2>
        <p className="text-gray-700 mb-4">
          Applicant data accessed through GoHire must be used **only for legitimate 
          hiring purposes**. Recruiters must not share, sell, or distribute applicant 
          information without explicit consent.
        </p>

        {/* 6. Fees & Payments (if applicable) */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          6. Fees & Payments
        </h2>
        <p className="text-gray-700 mb-4">
          Certain premium features may require payment. All fees will be disclosed before 
          purchase. Refund eligibility (if any) is governed by the GoHire Refund Policy.
        </p>

        {/* 7. Account Suspension */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          7. Account Suspension or Termination
        </h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>GoHire may suspend or terminate recruiter accounts for policy violations.</li>
          <li>Fraudulent or harmful activities may lead to permanent removal.</li>
          <li>Legal authorities may be notified in case of severe violations.</li>
        </ul>

        {/* 8. Platform Limitations */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          8. Platform Limitations
        </h2>
        <p className="text-gray-700 mb-4">
          GoHire provides a hiring platform but does not guarantee:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>Applicant quality or authenticity</li>
          <li>Response rates or successful hiring outcomes</li>
          <li>Continuous, uninterrupted service (though we aim for high uptime)</li>
        </ul>

        {/* 9. Changes to Terms */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          9. Changes to These Terms
        </h2>
        <p className="text-gray-700 mb-4">
          GoHire may update these Terms periodically. Continued use of the platform 
          after updates signifies acceptance of the revised Terms.
        </p>

        {/* 10. Contact */}
        <h2 className="text-2xl font-semibold text-blue-600 mt-8 mb-4">
          10. Contact Us
        </h2>
        <p className="text-gray-700 mb-2">
          For questions or compliance concerns, contact:
        </p>
        <p className="font-medium text-blue-700">recruitersupport@gohire.com</p>

        <p className="mt-8 text-sm text-gray-500">Last Updated: December 2025</p>

      </div>
    </div>
  );
};

export default TermsRecruiter;
