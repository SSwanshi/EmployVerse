import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import ApplicantTable from '../../components-admin/ApplicantTable';
import Header from '../../components/common/Header';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const ApplicantList = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getApplicants();
      setApplicants(data);
    } catch (err) {
      setError('Failed to fetch applicants');
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
      await adminApi.deleteApplicant(deleteDialog.id);
      setApplicants(applicants.filter(applicant => applicant._id !== deleteDialog.id));
      setDeleteDialog({ isOpen: false, id: null });
    } catch {
      alert('Failed to delete applicant');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Applicants" />
        <div className="text-center py-12">Loading applicants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Applicants" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Applicants" />
      <div className="mt-6">
        <ApplicantTable applicants={applicants} onDelete={handleDeleteClick} />
      </div>
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Applicant"
        message="Are you sure you want to delete this applicant? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ApplicantList;
