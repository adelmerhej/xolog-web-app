"use client";

import { useEffect, useState, useMemo } from "react";
import { ITotalProfit } from "@/types/reports/ITotalProfit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

export default function TotalProfitComponent() {
  const [jobs, setJobs] = useState<ITotalProfit[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Define columns
  const columns = useMemo<ColumnDef<ITotalProfit>[]>(
    () => [
    
      {
        accessorKey: "JobNo",
        header: "Job No",
      },
      {
        accessorKey: "JobDate",
        header: "Job Date",
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        },
      },
      {
        accessorKey: "CustomerName",
        header: "Customer",
      },
      {
        accessorKey: "StatusType",
        header: "Status",
      },
      {
        accessorKey: "ETA",
        header: "ETA",
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return "";
          const date = new Date(value as string);
          return isNaN(date.getTime()) ? "" : date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        },
      },
      {
        accessorKey: "ATA",
        header: "ATA",
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return "";
          const date = new Date(value as string);
          return isNaN(date.getTime()) ? "" : date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        },
      },
      {
        accessorKey: "CountryOfDeparture",
        header: "Country",
      },
      {
        accessorKey: "ReferenceNo",
        header: "Reference",
      },
      {
        accessorKey: "TotalProfit",
        header: "Profit",
        cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
      },
    ],
    []
  );

  // Fetch data
  useEffect(() => {
    fetch("/api/total-profit")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setJobs(data.data);
        } else {
          console.error("API response is not an array:", data);
          setJobs([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setJobs([]);
      });
  }, []);

  // Initialize table
  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6 space-y-4">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search all columns..."
            className="w-1/3"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        


        {/* Table */}
               <div className="overflow-auto rounded border">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-2 py-1.5 text-left bg-gray-100 font-medium">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-sm">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-1.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
          </div>
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="p-2 border rounded"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}