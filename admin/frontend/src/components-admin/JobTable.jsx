import Table, { TableRow, TableCell } from '../components/ui/Table';

const JobTable = ({ jobs, onDelete }) => {
  const headers = [
    { label: 'Title' },
    { label: 'Company' },
    { label: 'Location' },
    { label: 'Salary' },
    { label: 'Actions', align: 'right' },
  ];

  if (jobs.length === 0) {
    return <Table headers={headers} emptyMessage="No jobs found" />;
  }

  return (
    <Table headers={headers}>
      {jobs.map((job) => (
        <TableRow key={job._id}>
          <TableCell>
            <span className="font-medium text-gray-900">{job.jobTitle}</span>
          </TableCell>
          <TableCell>{job.companyName || '-'}</TableCell>
          <TableCell>{job.jobLocation || '-'}</TableCell>
          <TableCell>{job.jobSalary ? `$${job.jobSalary}` : '-'}</TableCell>
          <TableCell align="right">
            <button
              onClick={() => onDelete(job._id)}
              className="text-red-600 hover:text-red-900 font-medium"
            >
              Delete
            </button>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default JobTable;
