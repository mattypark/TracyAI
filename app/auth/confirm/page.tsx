"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type")

      if (!token_hash || type !== "email") {
        setStatus("error")
        setMessage("Invalid confirmation link")
        return
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        })

        if (error) throw error

        if (data.user) {
          // Create user record if it doesn't exist
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (userError && userError.code === "PGRST116") {
            // User doesn't exist, create them
            await supabase.from("users").insert({
              id: data.user.id,
              email: data.user.email!,
              onboarding_completed: false,
            })
          }

          setStatus("success")
          setMessage("Your email has been confirmed successfully!")

          // Redirect to onboarding after 2 seconds
          setTimeout(() => {
            router.push("/onboarding")
          }, 2000)
        }
      } catch (error: any) {
        console.error("Confirmation error:", error)
        setStatus("error")
        setMessage(error.message || "Failed to confirm email")
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4"
            >
              {status === "loading" && <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />}
              {status === "success" && <CheckCircle className="w-16 h-16 text-green-600" />}
              {status === "error" && <XCircle className="w-16 h-16 text-red-600" />}
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === "loading" && "Confirming your email..."}
              {status === "success" && "Email Confirmed!"}
              {status === "error" && "Confirmation Failed"}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{message}</p>

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <p className="text-sm text-gray-500">Redirecting you to complete setup...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                  />
                </div>
              </motion.div>
            )}

            {status === "error" && (
              <Button onClick={() => router.push("/auth")} className="w-full bg-black hover:bg-gray-800 text-white">
                Back to Sign In
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
