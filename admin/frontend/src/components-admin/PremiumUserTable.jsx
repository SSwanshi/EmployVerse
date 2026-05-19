import Table, { TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { formatDate } from '../utils/formatDate';

const PremiumUserTable = ({ premiumUsers }) => {
  const headers = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Status' },
    { label: 'Member Since' },
  ];

  if (premiumUsers.length === 0) {
    return <Table headers={headers} emptyMessage="No premium users found" />;
  }

  return (
    <Table headers={headers}>
      {premiumUsers.map((user, index) => (
        <TableRow key={index}>
          <TableCell>
            <span className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </span>
          </TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>
            <Badge variant="primary">{user.status || 'Premium'}</Badge>
          </TableCell>
          <TableCell>{formatDate(user.memberSince)}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default PremiumUserTable;
