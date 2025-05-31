import mongoose, { Document, Schema, Model } from "mongoose";

interface IClientsInvoiceReport extends Document {
  JobNo: string;
  QuotationNo: string;
  Mbl: string;
  InvoiceNo: string;
  DueDate: Date;
  TotalInvoice: number;
  Pol: string;
  Pod: string;
  Volume: string;
  Consignee: string;
  ETD: Date;
  ETA: Date;
  ATD: Date;
  ATA: Date;
  Status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientsInvoiceReportSchema: Schema<IClientsInvoiceReport> = new Schema(
  {
    JobNo: {
      type: String,
      required: [true, "JobNo is required"],
      maxlength: [50, "JobNo cannot exceed 50 characters"],
    },
    QuotationNo: {
      type: String,
      default: "",
      maxlength: [50, "QuotationNo cannot exceed 50 characters"],
    },
    Mbl: {
      type: String,
      default: "",
      maxlength: [50, "Mbl cannot exceed 50 characters"],
    },
    InvoiceNo: {
      type: String,
      required: [true, "InvoiceNo is required"],
      maxlength: [50, "InvoiceNo cannot exceed 50 characters"],
    },
    DueDate: {
      type: Date,
      required: [true, "DueDate is required"],
    },
    TotalInvoice: {
      type: Number,
      required: [true, "TotalInvoice is required"],
      min: [0, "TotalInvoice cannot be negative"],
    },
    Pol: {
      type: String,
      default: "",
      maxlength: [100, "Pol cannot exceed 100 characters"],
    },
    Pod: {
      type: String,
      default: "",
      maxlength: [100, "Pod cannot exceed 100 characters"],
    },
    Volume: {
      type: String,
      default: "",
    },
    Consignee: {
      type: String,
      default: "",
      maxlength: [100, "Consignee cannot exceed 100 characters"],
    },
    ETD: {
      type: Date,
      default: null,
    },
    ETA: {
      type: Date,
      default: null,
    },
    ATD: {
      type: Date,
      default: null,
    },
    ATA: {
      type: Date,
      default: null,
    },
    Status: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, collection: "ClientsInvoiceReport" }
);

// Add indexes for better performance
ClientsInvoiceReportSchema.index({ JobNo: 1 });
ClientsInvoiceReportSchema.index({ InvoiceNo: 1 });
ClientsInvoiceReportSchema.index({ Mbl: 1 });
ClientsInvoiceReportSchema.index({ QuotationNo: 1 });
ClientsInvoiceReportSchema.index({ Status: 1 });
ClientsInvoiceReportSchema.index({ DueDate: 1 });

export const ClientsInvoiceReportModel: Model<IClientsInvoiceReport> =
  mongoose.models.ClientsInvoiceReport || 
  mongoose.model<IClientsInvoiceReport>("ClientsInvoiceReport", ClientsInvoiceReportSchema);