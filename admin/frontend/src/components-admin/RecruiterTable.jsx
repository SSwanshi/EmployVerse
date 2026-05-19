import Table, { TableRow, TableCell } from '../components/ui/Table';
import { formatDate } from '../utils/formatDate';

const RecruiterTable = ({ recruiters, onDelete }) => {
  const headers = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Created At' },
    { label: 'Actions', align: 'right' },
  ];

  if (recruiters.length === 0) {
    return <Table headers={headers} emptyMessage="No recruiters found" />;
  }

  return (
    <Table headers={headers}>
      {recruiters.map((recruiter) => (
        <TableRow key={recruiter._id}>
          <TableCell>
            <span className="font-medium text-gray-900">
              {recruiter.firstName} {recruiter.lastName}
            </span>
          </TableCell>
          <TableCell>{recruiter.email}</TableCell>
          <TableCell>{formatDate(recruiter.createdAt)}</TableCell>
          <TableCell align="right">
            <button
              onClick={() => onDelete(recruiter._id)}
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

export default RecruiterTable;
