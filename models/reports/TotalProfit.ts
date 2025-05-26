import mongoose, { Document, Schema, Model } from "mongoose";

interface ITotalProfit extends Document {
  JobNo: string;
  JobDate: Date;
  CustomerName: string;
  ConsigneeName: string;
  DepartmentName: string;
  StatusType: string;
  TotalProfit: number;
  ETA: Date;
  ATA: Date;
  UserName: string;
  Notes: string;
  CountryOfDeparture: string;
  Departure: string;
  Destination: string;
  ReferenceNo: string;
  vessel: string;
  TotalInvoices: number;
  TotalCosts: number;
  createdAt: Date;
  updatedAt: Date;
}

const TotalProfitSchema = new Schema<ITotalProfit>(
  {
    JobNo: { type: String, required: true },
    JobDate: { type: Date, required: true },
    CustomerName: { type: String, required: true },
    ConsigneeName: { type: String, required: true },
    DepartmentName: { type: String, required: true },
    StatusType: { type: String, required: true },
    TotalProfit: { type: Number, required: true },
    ETA: { type: Date, required: true },
    ATA: { type: Date, required: true },
    UserName: { type: String, required: true },
    Notes: { type: String },
    CountryOfDeparture: { type: String, required: true },
    Departure: { type: String, required: true },
    Destination: { type: String, required: true },
    ReferenceNo: { type: String, required: true },
    vessel: { type: String, required: true },
    TotalInvoices: { type: Number, required: true },
    TotalCosts: { type: Number, required: true },
  },
  { timestamps: true }
);

export const TotalProfitModel: Model<ITotalProfit> =
  mongoose.models.TotalProfit || mongoose.model<ITotalProfit>("TotalProfit", TotalProfitSchema);