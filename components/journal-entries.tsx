"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { JournalEntry } from "@/lib/supabase"
import { format } from "date-fns"

interface JournalEntriesProps {
  entries: JournalEntry[]
}

export function JournalEntries({ entries }: JournalEntriesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500">No journal entries found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4 flex-1">
      {selectedEntry ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{formatDate(selectedEntry.date || selectedEntry.created_at)}</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)} className="text-sm">
              Back to All
            </Button>
          </div>
          
          <Card className="border border-gray-100">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mr-2">
                    <span className="text-sm font-medium">{selectedEntry.productivity_score || 5}</span>
                  </div>
                  <span className="text-sm dark:text-gray-300">Productivity Score</span>
                </div>
              </div>
              
              {selectedEntry.summary && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Summary</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedEntry.summary}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium mb-1">Journal Entry</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>
              
              {selectedEntry.timeline && selectedEntry.timeline.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Timeline</h3>
                  <div className="space-y-2">
                    {selectedEntry.timeline.map((item, i) => (
                      <div key={i} className="flex items-start">
                        <div className="text-xs font-medium w-16 text-gray-500">{item.time}</div>
                        <div className="text-sm">{item.activity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEntry.activities && selectedEntry.activities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Activities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.activities.map((activity, i) => (
                      <span key={i} className="text-xs py-1 px-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Journal Entries</h2>
            {entries.length > 3 && (
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-sm">
                {isExpanded ? "Show Less" : "View All"}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {entries.slice(0, isExpanded ? entries.length : 3).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedEntry(entry)}
                className="cursor-pointer"
              >
                <Card className="border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-500">{formatDate(entry.date || entry.created_at)}</p>
                        <p className="font-medium text-sm">{entry.summary || entry.content.substring(0, 60) + "..."}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center">
                        <span className="text-xs font-medium">{entry.productivity_score || 5}</span>
                      </div>
                    </div>
                    {entry.activities && entry.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.activities.slice(0, 3).map((activity, i) => (
                          <span key={i} className="text-xs py-1 px-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            {activity}
                          </span>
                        ))}
                        {entry.activities.length > 3 && (
                          <span className="text-xs py-1 px-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            +{entry.activities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{entry.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
