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

// const getDepartmentIds = (department: string): { ids: number[], specialCondition?: { id: number, jobType: number } } => {
//   switch (department) {
//     case "Import":
//       return { ids: [5, 16] };
//     case "Export":
//       return { ids: [2, 18] };
//     case "Clearance":
//       return { ids: [8, 17] };
//     case "Land Freight":
//       return { ids: [6] };
//     case "Sea Cross":
//       return { ids: [16], specialCondition: { id: 16, jobType: 3 } };
//     default:
//       return { ids: [16] };
//   }
// };

export default function JobStatusComponent() {
  const [jobs, setJobs] = useState<ITotalProfit[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [grandTotalProfit, setGrandTotalProfit] = useState(0);

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "New",
    "Delivered",
  ]);

  const departments = [
    "Import",
    "Export",
    "Clearance",
    "Land Freight",
    "Sea Cross",
  ];
  const statuses = ["New", "Cancelled", "Delivered"];
  // Presets for column visibility
  const presets = [
    {
      name: "Default",
      columns: [
        "JobDate",
        "JobNo",
        "ReferenceNo",
        "CustomerName",
        "PaymentDate",
        "MemberOf",
        "ATA",
        "ETA",
        "StatusType",
        "TotalProfit",
      ],
    },
    {
      name: "Minimal",
      columns: [
        "JobDate",
        "JobNo",
        "ReferenceNo",
        "CustomerName",
        "PaymentDate",
        "StatusType",
        "TotalProfit",
      ],
    },
    // Add more presets as needed
  ];

  // Function to set column visibility based on preset
  const setPreset = (columnKeys: string[]) => {
    table.getAllLeafColumns().forEach((col) => {
      col.toggleVisibility(columnKeys.includes(col.id));
    });
  };

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartments((prev) => {
      const isSelected = prev.includes(dept);
      const newSelection = isSelected
        ? prev.filter((d) => d !== dept)
        : [...prev, dept];
      return newSelection;
    });
  };
  const handleStatusesChange = (status: string) => {
    setSelectedStatuses((prev) => {
      const isSelected = prev.includes(status);
      const newSelection = isSelected
        ? prev.filter((d) => d !== status)
        : [...prev, status];
      return newSelection;
    });
  };

  const filteredJobs = jobs;

  // Define columns
  const columns = useMemo<ColumnDef<ITotalProfit>[]>(
    () => [
      {
        accessorKey: "JobDate",
        header: "Job Date",
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "JobNo",
        header: "Job No",
      },
      {
        accessorKey: "ReferenceNo",
        header: "Reference",
      },
      {
        accessorKey: "CustomerName",
        header: "Customer",
      },
      {
        accessorKey: "PaymentDate",
        header: "Payment Date",
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return "";
          const date = new Date(value as string);
          return isNaN(date.getTime())
            ? ""
            : date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
        },
      },
      {
        accessorKey: "MemberOf",
        header: "MemberOf",
      },
      {
        id: "Arrival",
        header: "Arrival",
        cell: ({ row }) => {
          const ata = row.original.ATA;
          const eta = row.original.ETA;
          const value = ata || eta;
          if (!value) return "";
          const date = new Date(String(value));
          return isNaN(date.getTime())
            ? ""
            : date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
        },
      },
      {
        accessorKey: "StatusType",
        header: "Status",
      },
      {
        accessorKey: "TotalProfit",
        header: "Profit",
        cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
      },
    ],
    []
  );

  //Calculate total profit
  const totalProfitSum = useMemo(
    () =>
      filteredJobs.reduce(
        (sum, job) =>
          sum +
          (typeof job.TotalProfit === "number"
            ? job.TotalProfit
            : Number(job.TotalProfit) || 0),
        0
      ),
    [filteredJobs]
  );

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const queryParams = new URLSearchParams({
        //   page: String(pagination.pageIndex + 1),
        //   limit: String(pagination.pageSize),
        //   departments: selectedDepartments.join(',')
        // });
        const queryParams = new URLSearchParams();
        queryParams.set("page", String(pagination.pageIndex + 1));
        queryParams.set("limit", String(pagination.pageSize));

        // Only add departments if there are any selected
        if (selectedDepartments.length > 0) {
          queryParams.set("departments", selectedDepartments.join(","));
        }

        // Only add Status if there are any selected
        if (selectedStatuses.length > 0) {
          queryParams.set("status", selectedStatuses.join(","));
        }

        const res = await fetch(`/api/job-status?${queryParams}`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();

        if (Array.isArray(data.data)) {
          setJobs(data.data);
          setTotalCount(data.pagination.total);
          setGrandTotalProfit(data.pagination.grandTotalProfit ?? 0);
        } else {
          console.error("Invalid API response", data);
          setJobs([]);
          setTotalCount(0);
          setGrandTotalProfit(0);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobs([]);
        setTotalCount(0);
        setGrandTotalProfit(0);
      }
    };
    fetchData();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    selectedDepartments,
    selectedStatuses,
  ]);

  // Initialize table
  const table = useReactTable({
    data: filteredJobs,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize), // total pages from API
    manualPagination: true, // key part!
    state: {
      pagination,
      globalFilter,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <div className="text-sm text-gray-500">
        Total rows: {totalCount} | Page{" "}
        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} |
        Rows per page: {table.getState().pagination.pageSize}
      </div>

      <div className="flex min-h-screen">
        <div className="flex-1 p-2 space-y-4">
          {/* Topbar */}
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search all columns..."
              className="w-1/3"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />

            {/* Department Filter dropdown checklist */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeptDropdown((v) => !v)}
              >
                Department
              </Button>
              {showDeptDropdown && (
                <div className="absolute z-10 mt-2 w-48 bg-white border rounded shadow p-2">
                  <label className="flex items-center gap-2 px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={selectedDepartments.length === 0}
                      onChange={() => setSelectedDepartments([])}
                    />
                    All
                  </label>
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={dept}
                        checked={selectedDepartments.includes(dept)}
                        onChange={() => handleDepartmentChange(dept)}
                      />
                      <label htmlFor={dept}>{dept}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter dropdown checklist */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusDropdown((v) => !v)}
              >
                Status
              </Button>
              {showStatusDropdown && (
                <div className="absolute z-10 mt-2 w-48 bg-white border rounded shadow p-2">
                  <label className="flex items-center gap-2 px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.length === 0}
                      onChange={() => setSelectedStatuses([])}
                    />
                    All
                  </label>
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={status}
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusesChange(status)}
                      />
                      <label htmlFor={status}>{status}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Column visibility dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDropdown((v) => !v)}
              >
                Columns
              </Button>
              {showDropdown && (
                <div className="absolute right-0 z-10 mt-2 w-56 bg-white border rounded shadow p-2">
                  <div className="mb-2 font-semibold text-xs text-gray-600">
                    Presets
                  </div>
                  <div className="flex gap-2 mb-2">
                    {presets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreset(preset.columns);
                          setShowDropdown(false);
                        }}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                  <div className="mb-1 font-semibold text-xs text-gray-600">
                    Columns
                  </div>
                  {table.getAllLeafColumns().map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 px-1 py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={() => col.toggleVisibility()}
                      />
                      {col.columnDef.header as string}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-6">
              <div className="flex">
                Total profit (page):{" "}
                <span className="ml-2 font-semibold text-green-700">
                  $
                  {totalProfitSum.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex">
                Grand total:{" "}
                <span className="ml-2 font-semibold text-blue-700">
                  $
                  {grandTotalProfit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredJobs.length === 0 ? (
            <div className="text-center p-4">No data available</div>
          ) : (
            <div className="overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-2 py-1.5 text-left bg-gray-100 font-medium"
                        >
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
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center p-4">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

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
    </>
  );
}
