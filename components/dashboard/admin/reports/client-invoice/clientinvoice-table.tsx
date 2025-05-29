"use client";

import { useEffect, useState, useMemo } from "react";
import { ITotalProfit } from "@/types/reports/ITotalProfit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClientInvoiceComponent() {
  const [jobs, setJobs] = useState<ITotalProfit[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [grandTotalProfit, setGrandTotalProfit] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Presets for column visibility
  const presets = [
    {
      name: "Default",
      columns: [
        "JobNo",
        "JobDate",
        "CustomerName",
        "ConsigneeName",
        "ReferenceNo",
        "StatusType",
        "ETA",
        "ATA",
        "CountryOfDeparture",
        "Destination",
        "TotalProfit",
      ],
    },
    {
      name: "Minimal",
      columns: [
        "JobNo",
        "JobDate",
        "CustomerName",
        "StatusType",
        "CountryOfDeparture",
        "Destination",
        "TotalProfit",
      ],
    },
  ];

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
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "CustomerName",
        header: "Customer",
      },
      {
        accessorKey: "ConsigneeName",
        header: "Consignee",
      },
      {
        accessorKey: "ReferenceNo",
        header: "Reference",
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
        accessorKey: "ATA",
        header: "ATA",
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
        accessorKey: "CountryOfDeparture",
        header: "Departure",
      },
      {
        accessorKey: "Destination",
        header: "Destination",
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
      jobs.reduce(
        (sum, job) =>
          sum +
          (typeof job.TotalProfit === "number"
            ? job.TotalProfit
            : Number(job.TotalProfit) || 0),
        0
      ),
    [jobs]
  );

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/reports/admin/total-profit?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`
        );
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
  }, [pagination.pageIndex, pagination.pageSize]);

  // Initialize table
  const table = useReactTable({
    data: jobs,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="text-sm text-muted-foreground">
        Total rows: {totalCount} | Page{" "}
        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} |
        Rows per page: {table.getState().pagination.pageSize}
      </div>

      <div className="flex items-center justify-between">
        <Input
          placeholder="Search all columns..."
          className="max-w-sm"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />

        <div className="flex items-center gap-4">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Presets</DropdownMenuLabel>
              <div className="flex flex-wrap gap-1 px-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      const newVisibility: VisibilityState = {};
                      table.getAllLeafColumns().forEach((col) => {
                        newVisibility[col.id] = preset.columns.includes(col.id);
                      });
                      setColumnVisibility(newVisibility);
                    }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-6">
            <div className="flex items-center">
              <span className="text-sm">Page profit:</span>
              <span className="ml-2 font-semibold text-green-700">
                $
                {totalProfitSum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm">Grand total:</span>
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
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
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
        <span className="flex items-center gap-1 text-sm">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}