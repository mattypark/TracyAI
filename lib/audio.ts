export class AudioService {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private isRecording = false

  async startRecording(): Promise<void> {
    try {
      // Stop any existing recording first
      if (this.isRecording) {
        await this.stopRecording()
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      this.audioChunks = []

      // Check if MediaRecorder supports the preferred format
      let mimeType = "audio/webm;codecs=opus"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm"
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4"
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "" // Let browser choose
          }
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType || undefined,
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        this.cleanup()
      }

      this.mediaRecorder.start(100) // Collect data every 100ms
      this.isRecording = true
    } catch (error) {
      console.error("Error starting recording:", error)
      this.cleanup()
      throw new Error("Failed to start recording. Please check microphone permissions.")
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("No recording in progress"))
        return
      }

      this.mediaRecorder.onstop = () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || "audio/webm"
          const audioBlob = new Blob(this.audioChunks, { type: mimeType })
          this.cleanup()
          resolve(audioBlob)
        } catch (error) {
          this.cleanup()
          reject(error)
        }
      }

      this.mediaRecorder.stop()
      this.isRecording = false
    })
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
  }

  getRecordingState(): boolean {
    return this.isRecording
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Transcription failed: ${errorText}`)
      }

      const data = await response.json()
      return data.transcription || ""
    } catch (error) {
      console.error("Transcription error:", error)
      throw new Error("Failed to transcribe audio. Please try again.")
    }
  }
}

export const audioService = new AudioService()
