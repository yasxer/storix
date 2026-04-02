'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { X, Camera, RefreshCw } from 'lucide-react'

export function ScannerModal({ 
  onScan, 
  onClose,
  isOpen 
}: { 
  onScan: (result: string) => void
  onClose: () => void
  isOpen: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState<string>('')
  
  // Need a stable ref to the reader to clean it up properly
  const codeReader = useRef(new BrowserMultiFormatReader())

  useEffect(() => {
    if (!isOpen) return

    let mounted = true

    // List cameras
    codeReader.current.listVideoInputDevices()
      .then((videoInputDevices) => {
        if (!mounted) return
        setVideoInputDevices(videoInputDevices)
        
        if (videoInputDevices.length > 0) {
          // Default to the last camera (usually back camera on mobile)
          setSelectedDeviceId(videoInputDevices[videoInputDevices.length - 1].deviceId)
        } else {
          setError('No camera found')
        }
      })
      .catch((err) => {
        if (!mounted) return
        console.error(err)
        setError('Error accessing camera: ' + err.message)
      })

    return () => {
      mounted = false
      codeReader.current.reset()
    }
  }, [isOpen])

  // Start scanning when a device is selected
  useEffect(() => {
    if (!isOpen || !selectedDeviceId || !videoRef.current) return

    const reader = codeReader.current
    
    // Start decoding from video device
    reader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
      if (result) {
        // Stop scanning after success
        reader.reset()
        // Pass result up
        onScan(result.getText())
        onClose()
      }
      
      // We ignore NotFoundException and other scanning errors since they happen continuously
      // while looking for a barcode
    })

    return () => {
      reader.reset()
    }
  }, [selectedDeviceId, isOpen, onScan, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col relative">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Camera size={20} />
            Scan Barcode
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </div>
        
        <div className="relative aspect-square md:aspect-video bg-black flex-1 overflow-hidden">
          {error ? (
             <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4 text-center text-sm">
                {error}
             </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                muted 
                playsInline
              />
              
              {/* Overlay with scanning guide */}
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
                 <div className="w-full h-full max-w-[250px] max-h-[150px] border-2 border-[var(--color-primary)] rounded-lg relative shadow-[0_0_0_999px_rgba(0,0,0,0.4)]">
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/50 shadow-[0_0_8px_red] shadow-red-500 -translate-y-1/2" />
                 </div>
              </div>
            </>
          )}
        </div>

        {videoInputDevices.length > 1 && (
          <div className="p-4 bg-white/95 backdrop-blur absolute bottom-0 w-full border-t">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wider">
              Switch Camera
            </label>
            <div className="flex gap-2 w-full overflow-x-auto pb-1 snap-x">
              {videoInputDevices.map((device, idx) => (
                <button
                  key={device.deviceId}
                  className={`px-3 py-1.5 text-sm rounded-lg border whitespace-nowrap snap-center transition flex-shrink-0 ${
                    selectedDeviceId === device.deviceId 
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' 
                    : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDeviceId(device.deviceId)}
                >
                  <RefreshCw size={14} className="inline mr-1 opacity-50" />
                  {device.label || `Camera ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
