import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Transcription API: Received request");
    
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      console.error("Transcription API: No audio file provided");
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    console.log("Transcription API: Audio file received", {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Convert File to Buffer for OpenAI API
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Check if we have an API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Transcription API: Missing OpenAI API key");
      return NextResponse.json({ 
        error: "Configuration error - missing API key",
        transcription: "I couldn't transcribe your audio due to a configuration issue. Please try typing instead." 
      }, { status: 200 }) // Return 200 with a message to avoid breaking the UI
    }

    // Create a File-like object that OpenAI expects
    const file = new File([buffer], "audio.webm", { type: audioFile.type || "audio/webm" })

    console.log("Transcription API: Sending request to OpenAI");
    
    // Use OpenAI Whisper for transcription
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: (() => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("model", "whisper-1")
        formData.append("language", "en")
        return formData
      })(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Transcription API: OpenAI API error:", errorText)
      
      // Return a user-friendly message instead of an error
      return NextResponse.json({ 
        error: "Transcription service unavailable", 
        transcription: "I couldn't transcribe your audio. Please try typing instead." 
      }, { status: 200 }) // Return 200 with a message to avoid breaking the UI
    }

    const result = await response.json()
    console.log("Transcription API: Success", { text: result.text?.substring(0, 50) + "..." });
    
    return NextResponse.json({ transcription: result.text })
  } catch (error) {
    console.error("Transcription API: Error:", error)
    
    // Return a user-friendly message instead of an error
    return NextResponse.json({ 
      error: "Failed to transcribe audio", 
      transcription: "I couldn't transcribe your audio due to a technical issue. Please try typing instead." 
    }, { status: 200 }) // Return 200 with a message to avoid breaking the UI
  }
}
