import Table, { TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';

const CompanyTable = ({ companies, onDelete }) => {
  const headers = [
    { label: 'Company Name' },
    { label: 'Website' },
    { label: 'Location' },
    { label: 'Status' },
    { label: 'Actions', align: 'right' },
  ];

  if (companies.length === 0) {
    return <Table headers={headers} emptyMessage="No companies found" />;
  }

  return (
    <Table headers={headers}>
      {companies.map((company) => (
        <TableRow key={company._id}>
          <TableCell>
            <span className="font-medium text-gray-900">{company.companyName}</span>
          </TableCell>
          <TableCell>{company.website || '-'}</TableCell>
          <TableCell>{company.location || '-'}</TableCell>
          <TableCell>
            <Badge variant={company.verified ? 'success' : 'warning'}>
              {company.verified ? 'Verified' : 'Pending'}
            </Badge>
          </TableCell>
          <TableCell align="right">
            <button
              onClick={() => onDelete(company._id)}
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

export default CompanyTable;
