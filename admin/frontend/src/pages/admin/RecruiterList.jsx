import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import RecruiterTable from '../../components-admin/RecruiterTable';
import Header from '../../components/common/Header';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const RecruiterList = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getRecruiters();
      setRecruiters(data);
    } catch (err) {
      setError('Failed to fetch recruiters');
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
      await adminApi.deleteRecruiter(deleteDialog.id);
      setRecruiters(recruiters.filter(recruiter => recruiter._id !== deleteDialog.id));
      setDeleteDialog({ isOpen: false, id: null });
    } catch {
      alert('Failed to delete recruiter');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Recruiters" />
        <div className="text-center py-12">Loading recruiters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Recruiters" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Recruiters" />
      <div className="mt-6">
        <RecruiterTable recruiters={recruiters} onDelete={handleDeleteClick} />
      </div>
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Recruiter"
        message="Are you sure you want to delete this recruiter? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default RecruiterList;
