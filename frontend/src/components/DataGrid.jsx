import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function DataGrid({ columns, data }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6 text-center text-slate-500">
          No data available to preview.
        </CardContent>
      </Card>
    );
  }

  const pageCount = Math.ceil(data.length / pageSize);
  const currentRows = data.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <Card className="w-full bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-900">Data Explorer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-none border border-slate-200">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="p-3 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {currentRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {columns.map((col) => (
                    <td key={col} className="p-3 truncate max-w-[150px] text-xs">
                      {row[col] !== null ? String(row[col]) : "null"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Page {currentPage + 1} of {pageCount}</span>
          <div className="space-x-2">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 rounded-none border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={currentPage >= pageCount - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 rounded-none border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DataGrid;
