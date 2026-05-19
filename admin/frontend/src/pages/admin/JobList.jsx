import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import JobTable from '../../components-admin/JobTable';
import Header from '../../components/common/Header';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const JobList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getJobs();
      setCompanies(data);
    } catch (err) {
      setError('Failed to fetch jobs');
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
      await adminApi.deleteJob(deleteDialog.id);
      fetchJobs();
      setDeleteDialog({ isOpen: false, id: null });
    } catch {
      alert('Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Jobs" />
        <div className="text-center py-12">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Jobs" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  const allJobs = companies.flatMap(company => 
    (company.jobs || []).map(job => ({ ...job, companyName: company.companyName }))
  );

  return (
    <div>
      <Header title="Jobs" />
      <div className="mt-6">
        <JobTable jobs={allJobs} onDelete={handleDeleteClick} />
      </div>
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default JobList;
