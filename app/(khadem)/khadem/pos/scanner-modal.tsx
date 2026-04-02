'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { X, Camera } from 'lucide-react'

export function ScannerModal({ 
  onScan, 
  onClose,
  isOpen 
}: { 
  onScan: (result: string) => void
  onClose: () => void
  isOpen: boolean
}) {
  const [error, setError] = useState<string>('')
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let mounted = true
    const readerId = "reader"

    // Delay start slightly to ensure DOM is ready
    const timer = setTimeout(() => {
      async function startScanner() {
        try {
          // Ask for permission manually first (helps with browsers that block auto-start)
          await navigator.mediaDevices.getUserMedia({ video: true })
          
          if (!mounted) return

          const html5QrCode = new Html5Qrcode(readerId)
          html5QrCodeRef.current = html5QrCode

          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 150 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              if (!mounted) return
              mounted = false
              
              // Success
              const scanner = html5QrCodeRef.current
              if (scanner && scanner.getState && scanner.getState() === 2 /* SCANNING */) {
                scanner.stop().then(() => {
                  onScan(decodedText)
                  onClose()
                }).catch(() => {
                   onScan(decodedText)
                   onClose()
                })
              } else {
                onScan(decodedText)
                onClose()
              }
            },
            (errorMessage) => {
              // Ignore typical parse errors
            }
          )
        } catch (err: any) {
          if (mounted) {
            console.error(err)
            setError(err?.message || 'Error accessing camera. Please check permissions.')
          }
        }
      }

      startScanner()
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
      const scanner = html5QrCodeRef.current
      if (scanner) {
        try {
          if (scanner.getState && scanner.getState() > 1) {
            scanner.stop().catch(e => console.log('Stop ignored:', e))
          }
        } catch (e) {
          // ignore synchronous errors thrown by stop()
        }
      }
    }
  }, [isOpen, onScan, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col relative min-h-[400px]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 z-10 relative">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-black">
            <Camera size={24} className="text-[var(--color-primary)]" />
            Scanner Barcode
          </h3>
          <Button variant="ghost" size="icon" onClick={() => {
             // ensure scanner is stopped before closing
             const scanner = html5QrCodeRef.current
             try {
               if (scanner && scanner.getState && scanner.getState() > 1) {
                  scanner.stop().catch(() => {}).finally(() => onClose())
               } else {
                  onClose()
               }
             } catch (e) {
               onClose()
             }
          }} className="rounded-full text-black hover:bg-gray-200 p-2">
            <X size={24} />
          </Button>
        </div>
        
        <div className="relative bg-black flex-1 w-full h-[350px] flex flex-col justify-center items-center overflow-hidden">
          {error ? (
             <div className="p-6 text-center z-10 text-white">
               <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
                 <p className="font-semibold mb-2 text-red-500 text-lg">Camera Access Denied</p>
                 <p className="text-sm">{error}</p>
                 <p className="text-xs mt-4 opacity-80">Make sure you have granted camera permissions in your browser. (The icon usually appears in the URL bar)</p>
               </div>
             </div>
          ) : (
            <div id="reader" className="w-[100%] max-h-full" />
          )}
        </div>
      </div>
    </div>
  )
}
