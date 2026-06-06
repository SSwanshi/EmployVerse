import React from 'react';

const TableSkeleton = ({ title = "Loading...", showAddButton = true, hasPageHeader = true, columns = 6 }) => {
  return (
    <div className={hasPageHeader ? "p-6 bg-gray-50 min-h-screen" : "w-full"}>
      {hasPageHeader && (
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-black">{title}</h2>
          {showAddButton && (
            <div className="h-10 w-32 bg-gray-300 rounded-md animate-pulse"></div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, row) => (
                <tr key={row}>
                  {Array.from({ length: columns }).map((_, col) => (
                    <td key={col} className="px-6 py-4 whitespace-nowrap">
                      {col === 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full shrink-0"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      ) : col === columns - 1 ? (
                        <div className="flex justify-end gap-2">
                           <div className="h-8 w-8 bg-gray-200 rounded"></div>
                           <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                      ) : (
                        <div className="h-4 bg-gray-200 rounded w-full max-w-[120px]"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
