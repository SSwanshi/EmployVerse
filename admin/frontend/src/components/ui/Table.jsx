const Table = ({ headers, children, emptyMessage = "No data found" }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  header.align === 'right' ? 'text-right' : ''
                }`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
      {!children || (Array.isArray(children) && children.length === 0) ? (
        <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
      ) : null}
    </div>
  );
};

export const TableRow = ({ children }) => {
  return <tr>{children}</tr>;
};

export const TableCell = ({ children, align = 'left' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
      align === 'right' ? 'text-right' : ''
    }`}>
      {children}
    </td>
  );
};

export default Table;

