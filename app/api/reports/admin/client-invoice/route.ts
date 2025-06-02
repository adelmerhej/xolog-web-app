import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { ClientsInvoiceReportModel } from "@/models/reports/InvoiceTracking";

// GET /api/admin/reports/client-invoice
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); 
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: Record<string, unknown> = {};
    if (status) {
      query.StatusType = status;
    }

    const totalInvoices = await ClientsInvoiceReportModel.find(query)
      .sort({ JobDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ClientsInvoiceReportModel.countDocuments(query);
    
    //Calculate grand total
    const grandTotalAgg = await ClientsInvoiceReportModel.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$TotalInvoiceAmount" } } },
    ]);
    const grandTotalInvoices = grandTotalAgg[0]?.total || 0;
    
    console.log("grand Total Invoices: ", grandTotalInvoices);

    if (totalInvoices.length === 0) {
      return NextResponse.json({
        success: false,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          grandTotalInvoices,
        },
      });
    }

    return NextResponse.json({
      
      success: true,
      data: totalInvoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        grandTotalInvoices,
      },
    });

    
  } catch (error) {
    console.error("Error fetching total profits:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}