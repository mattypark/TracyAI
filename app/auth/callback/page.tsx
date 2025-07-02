"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have a code parameter (OAuth callback)
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          console.error("OAuth error:", error)
          router.push(`/auth?error=oauth_${error}`)
          return
        }

        if (code) {
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error("Code exchange error:", exchangeError)
            router.push("/auth?error=exchange_failed")
            return
          }

          if (data.user) {
            // Check if user exists in our users table
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
                full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
                avatar_url: data.user.user_metadata?.avatar_url || '',
                onboarding_completed: false,
              })
              router.push("/onboarding")
            } else if (userData?.onboarding_completed) {
              router.push("/")
            } else {
              router.push("/onboarding")
            }
            return
          }
        }

        // If no code, check for existing session
        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          router.push("/auth?error=session_failed")
          return
        }

        if (data.session?.user) {
          // Check if user exists in our users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.session.user.id)
            .single()

          if (userError && userError.code === "PGRST116") {
            // User doesn't exist, create them
            await supabase.from("users").insert({
              id: data.session.user.id,
              email: data.session.user.email!,
              full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || '',
              avatar_url: data.session.user.user_metadata?.avatar_url || '',
              onboarding_completed: false,
            })
            router.push("/onboarding")
          } else if (userData?.onboarding_completed) {
            router.push("/")
          } else {
            router.push("/onboarding")
          }
        } else {
          router.push("/auth")
        }
      } catch (error) {
        console.error("Callback handling error:", error)
        router.push("/auth?error=callback_failed")
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
