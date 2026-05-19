import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import InternshipTable from '../../components-admin/InternshipTable';
import Header from '../../components/common/Header';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const InternshipList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getInternships();
      setCompanies(data);
    } catch (err) {
      setError('Failed to fetch internships');
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
      await adminApi.deleteInternship(deleteDialog.id);
      fetchInternships();
      setDeleteDialog({ isOpen: false, id: null });
    } catch {
      alert('Failed to delete internship');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Internships" />
        <div className="text-center py-12">Loading internships...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Internships" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  const allInternships = companies.flatMap(company => 
    (company.internships || []).map(int => ({ ...int, companyName: company.companyName }))
  );

  return (
    <div>
      <Header title="Internships" />
      <div className="mt-6">
        <InternshipTable internships={allInternships} onDelete={handleDeleteClick} />
      </div>
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Internship"
        message="Are you sure you want to delete this internship? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default InternshipList;
