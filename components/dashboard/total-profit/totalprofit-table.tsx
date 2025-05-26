"use client";

import { useEffect, useState } from "react";
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TotalProfitComponent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/total-profit")
      .then(res => res.json())
      .then(setJobs);
  }, []);

  const filtered = jobs.filter(job =>
    job.JobNo.toLowerCase().includes(search.toLowerCase()) ||
    job.CustomerName.toLowerCase().includes(search.toLowerCase())
  );

  
  return (
    <div className="flex min-h-screen">
    <div className="flex-1 p-6 space-y-4">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search Job No or Customer"
            className="w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
        </div>

        {/* Table + Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Total Profit Jobs</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Filter Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Button variant="ghost">Pending</Button>
              <Button variant="ghost">In Progress</Button>
              <Button variant="ghost">Completed</Button>
              <Button variant="ghost">Cancelled</Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Job Table */}
        <div className="overflow-auto rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>ATA</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(job => (
                <TableRow key={job._id}>
                  <TableCell>{job.JobNo}</TableCell>
                  <TableCell>{job.CustomerName}</TableCell>
                  <TableCell>{job.StatusType}</TableCell>
                  <TableCell>${job.TotalProfit.toFixed(2)}</TableCell>
                  <TableCell>{new Date(job.ETA).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(job.ATA).toLocaleDateString()}</TableCell>
                  <TableCell>{job.ReferenceNo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
