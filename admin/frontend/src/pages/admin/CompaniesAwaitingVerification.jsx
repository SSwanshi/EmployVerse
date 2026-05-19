import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { adminApi } from '../../services/adminApi';
import { decrementCount, fetchPendingVerificationsCount } from '../../store/slices/pendingVerificationsSlice';
import Header from '../../components/common/Header';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const CompaniesAwaitingVerification = () => {
  const dispatch = useDispatch();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
    dispatch(fetchPendingVerificationsCount());
  }, [dispatch]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCompaniesAwaitingVerification();
      setCompanies(data);
    } catch (err) {
      setError('Failed to fetch companies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminApi.verifyCompany(id);
      setCompanies(companies.filter(company => company._id !== id));
      dispatch(decrementCount());
      alert('Company verified successfully!');
    } catch {
      alert('Failed to verify company');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject and remove this company?')) {
      try {
        await adminApi.deleteCompany(id);
        setCompanies(companies.filter(company => company._id !== id));
        dispatch(decrementCount());
        alert('Company rejected and removed successfully!');
      } catch {
        alert('Failed to reject company');
      }
    }
  };

  const handleViewProof = async (proofId) => {
    if (proofId) {
      try {
        const blob = await adminApi.getProofDocument(proofId);
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        // Clean up the object URL after a delay to free memory
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } catch (error) {
        console.error('Error loading proof document:', error);
        alert('Failed to load proof document');
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Companies Awaiting Verification" />
        <div className="text-center py-12">Loading companies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Companies Awaiting Verification" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  const headers = [
    { label: 'Company Name' },
    { label: 'Website' },
    { label: 'Location' },
    { label: 'Proof Document' },
    { label: 'Actions', align: 'right' },
  ];

  return (
    <div>
      <Header title="Companies Awaiting Verification" />
      <div className="mt-6">
        {companies.length === 0 ? (
          <Table headers={headers} emptyMessage="No companies awaiting verification" />
        ) : (
          <Table headers={headers}>
            {companies.map((company) => (
              <TableRow key={company._id}>
                <TableCell>
                  <span className="font-medium text-gray-900">{company.companyName}</span>
                </TableCell>
                <TableCell>{company.website || '-'}</TableCell>
                <TableCell>{company.location || '-'}</TableCell>
                <TableCell>
                  {company.proofDocumentId ? (
                    <button
                      onClick={() => handleViewProof(company.proofDocumentId)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Proof
                    </button>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleVerify(company._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleReject(company._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};

export default CompaniesAwaitingVerification;
