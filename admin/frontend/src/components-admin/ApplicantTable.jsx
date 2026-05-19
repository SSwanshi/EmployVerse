import Table, { TableRow, TableCell } from '../components/ui/Table';
import { formatDate } from '../utils/formatDate';

const ApplicantTable = ({ applicants, onDelete }) => {
  const headers = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Company' },
    { label: 'Applied At' },
    { label: 'Actions', align: 'right' },
  ];

  if (applicants.length === 0) {
    return <Table headers={headers} emptyMessage="No applicants found" />;
  }

  return (
    <Table headers={headers}>
      {applicants.map((applicant) => (
        <TableRow key={applicant._id}>
          <TableCell>
            <span className="font-medium text-gray-900">
              {applicant.firstName} {applicant.lastName}
            </span>
          </TableCell>
          <TableCell>{applicant.email}</TableCell>
          <TableCell>{applicant.companyName || '-'}</TableCell>
          <TableCell>{formatDate(applicant.appliedAt)}</TableCell>
          <TableCell align="right">
            <button
              onClick={() => onDelete(applicant._id)}
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

export default ApplicantTable;
