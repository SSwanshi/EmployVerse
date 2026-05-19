import { applicantApi } from '../../services/applicantApi';

const CompanyCard = ({ company }) => {
  const logoUrl = company.logoId ? applicantApi.getLogo(company.logoId) : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center mb-4">
        {logoUrl ? (
          <img src={logoUrl} alt={company.companyName} className="h-20 w-20 object-contain" />
        ) : (
          <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xl">{company.companyName?.[0] || 'C'}</span>
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">{company.companyName || 'N/A'}</h3>
      {company.location && (
        <p className="text-gray-600 text-center mb-2">{company.location}</p>
      )}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm text-center block"
        >
          Visit Website
        </a>
      )}
    </div>
  );
};

export default CompanyCard;

