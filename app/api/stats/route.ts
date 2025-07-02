import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const stats = await db.getProductivityStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
