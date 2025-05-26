import { dbConnect } from "@/lib/mongoose";
import { TotalProfitModel } from "@/models/reports/TotalProfit";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const jobs = await TotalProfitModel.find({});
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}