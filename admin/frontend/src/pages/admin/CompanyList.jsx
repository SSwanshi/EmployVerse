import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import CompanyTable from '../../components-admin/CompanyTable';
import Header from '../../components/common/Header';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCompanies();
      setCompanies(data);
    } catch (err) {
      setError('Failed to fetch companies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ isOpen: true, id });
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteCompany(deleteDialog.id);
      setCompanies(companies.filter(company => company._id !== deleteDialog.id));
      setDeleteDialog({ isOpen: false, id: null });
    } catch {
      alert('Failed to delete company');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Companies" />
        <div className="text-center py-12">Loading companies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Companies" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Companies">
        <Link
          to="/companies/awaiting-verification"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          View Awaiting Verification
        </Link>
      </Header>
      <div className="mt-6">
        <CompanyTable companies={companies} onDelete={handleDeleteClick} />
      </div>
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Company"
        message="Are you sure you want to delete this company? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CompanyList;
