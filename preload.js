const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Add any electron-specific APIs you need
  platform: process.platform,
  
  // Voice-related APIs could be added here
  // startVoiceRecognition: () => ipcRenderer.invoke('start-voice-recognition'),
  // stopVoiceRecognition: () => ipcRenderer.invoke('stop-voice-recognition'),
  
  // System notifications
  // showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // App version
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
}) 