"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export function DashboardGrid() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Sample data
  const productivityStats = {
    weeklyAverage: 7.8,
    monthlyAverage: 7.2,
    streak: 5,
  }

  const todaysTasks = [
    { id: 1, title: "Complete project proposal", time: "5:00 PM", completed: false },
    { id: 2, title: "Call Dr. Smith", time: "10:00 AM", completed: false },
    { id: 3, title: "Gym session", time: "6:00 PM", completed: false },
  ]

  const reminders = [
    { id: 1, title: "Hit the gym", time: "11:19 PM", date: "Today" },
    { id: 2, title: "Fix the phone call feature", time: "10:00 AM", date: "Tomorrow" },
    { id: 3, title: "Check the car", time: "3:18 PM", date: "Friday" },
  ]

  const weekData = [
    { day: "Mon", score: 8 },
    { day: "Tue", score: 7 },
    { day: "Wed", score: 9 },
    { day: "Thu", score: 6 },
    { day: "Fri", score: 8 },
    { day: "Sat", score: 9 },
    { day: "Sun", score: 7 },
  ]

  const priorities = [
    { id: 1, title: "Hit the gym everyday", progress: 5, total: 7 },
    { id: 2, title: "Read for 30 minutes", progress: 3, total: 7 },
    { id: 3, title: "Limit screen time", progress: 2, total: 7 },
  ]

  const slides = [
    // Slide 1: Main Dashboard
    <div key="slide1" className="grid grid-cols-12 grid-rows-6 gap-3 h-full p-4">
      {/* Today's Reflection - Top Left */}
      <Card className="col-span-5 row-span-3 border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Today's Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-gray-600">
            "Today was pretty good. Went to workout, studied for 2 hours, then went out with friends..."
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center mr-2">
                <span className="text-xs font-medium">8</span>
              </div>
              <span className="text-xs">Productivity Score</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders - Top Right */}
      <Card className="col-span-7 row-span-3 border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                <span className="text-gray-500">{reminder.time}</span>
                <span className="ml-2">{reminder.title}</span>
              </div>
              <span className="text-gray-400">{reminder.date}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* To-dos - Bottom Left */}
      <Card className="col-span-5 row-span-3 border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">To-dos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todaysTasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2">
              <Checkbox id={`task-${task.id}`} checked={task.completed} className="h-3 w-3" />
              <label htmlFor={`task-${task.id}`} className="text-xs flex-1">
                {task.title}
              </label>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="text-xs mt-2 h-6">
            To-do +
          </Button>
        </CardContent>
      </Card>

      {/* Calendar - Bottom Right */}
      <Card className="col-span-7 row-span-3 border border-gray-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Calendar</CardTitle>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
              <span className="text-xs">Today</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["4", "5", "6", "7", "8", "9", "10"].map((day, index) => (
              <div key={day} className="text-xs">
                <div className="text-gray-400 mb-1">{["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"][index]}</div>
                <div
                  className={`text-xs ${index === 3 ? "bg-black text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto" : ""}`}
                >
                  {day}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="bg-gray-100 rounded p-1">
              <div className="text-xs text-gray-500">9 AM</div>
              <div className="text-xs">Morning gym</div>
            </div>
            <div className="bg-gray-100 rounded p-1">
              <div className="text-xs text-gray-500">11 AM</div>
              <div className="text-xs">Work on landing page</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>,

    // Slide 2: Stats and Priorities
    <div key="slide2" className="grid grid-cols-12 grid-rows-6 gap-3 h-full p-4">
      {/* Productivity Stats */}
      <Card className="col-span-6 row-span-2 border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Productivity Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold">{productivityStats.weeklyAverage}</div>
              <div className="text-xs text-gray-500">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{productivityStats.monthlyAverage}</div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{productivityStats.streak}</div>
              <div className="text-xs text-gray-500">Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card className="col-span-6 row-span-2 border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end h-16">
            {weekData.map((day) => (
              <div key={day.day} className="flex flex-col items-center">
                <div className="bg-gray-200 rounded-t w-4 mb-1" style={{ height: `${(day.score / 10) * 40}px` }}></div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priorities */}
      <Card className="col-span-12 row-span-4 border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Your Priorities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {priorities.map((priority) => (
            <div key={priority.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{priority.title}</span>
                <span className="text-xs text-gray-500">
                  {priority.progress}/{priority.total} days
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{
                    width: `${(priority.progress / priority.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>,
  ]

  return (
    <div className="h-full relative">
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {slides[currentSlide]}
      </motion.div>

      {/* Slide Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? "bg-black" : "bg-gray-300"}`}
            />
          ))}
        </div>
      )}

      {/* Swipe Navigation */}
      <div className="absolute inset-0 flex">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          className="flex-1 opacity-0"
          disabled={currentSlide === 0}
        />
        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          className="flex-1 opacity-0"
          disabled={currentSlide === slides.length - 1}
        />
      </div>
    </div>
  )
}
