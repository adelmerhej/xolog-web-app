export type JobStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";

export interface Job {
  _id: string;
  JobNo: string;
  JobDate: string;
  CustomerName: string;
  ConsigneeName: string;
  DepartmentName: string;
  StatusType: JobStatus;
  TotalProfit: number;
  ETA: string;
  ATA: string;
  UserName: string;
  Notes: string;
  CountryOfDeparture: string;
  Departure: string;
  Destination: string;
  ReferenceNo: string;
  vessel: string;
  TotalInvoices: number;
  TotalCosts: number;
}
