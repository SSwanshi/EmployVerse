import Table, { TableRow, TableCell } from '../components/ui/Table';

const InternshipTable = ({ internships, onDelete }) => {
  const headers = [
    { label: 'Title' },
    { label: 'Company' },
    { label: 'Location' },
    { label: 'Stipend' },
    { label: 'Actions', align: 'right' },
  ];

  if (internships.length === 0) {
    return <Table headers={headers} emptyMessage="No internships found" />;
  }

  return (
    <Table headers={headers}>
      {internships.map((internship) => (
        <TableRow key={internship._id}>
          <TableCell>
            <span className="font-medium text-gray-900">{internship.intTitle}</span>
          </TableCell>
          <TableCell>{internship.companyName || '-'}</TableCell>
          <TableCell>{internship.intLocation || '-'}</TableCell>
          <TableCell>{internship.intStipend ? `$${internship.intStipend}` : '-'}</TableCell>
          <TableCell align="right">
            <button
              onClick={() => onDelete(internship._id)}
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

export default InternshipTable;
