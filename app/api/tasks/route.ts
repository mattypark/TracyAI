import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const tasks = await db.getTasks()
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Tasks GET error:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json()
    const task = await db.createTask(taskData)
    return NextResponse.json({ task })
  } catch (error) {
    console.error("Tasks POST error:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    await db.updateTask(id, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Tasks PATCH error:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
