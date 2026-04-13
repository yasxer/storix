'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
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

  const stopScannerSafely = (callback?: () => void) => {
    const scanner = html5QrCodeRef.current;
    if (!scanner) {
      if (callback) callback();
      return;
    }

    try {
      const state = scanner.getState();
      if (state === 2 /* SCANNING */) {
        scanner.stop()
          .then(() => { if (callback) callback() })
          .catch(() => { if (callback) callback() });
      } else {
        if (callback) callback();
      }
    } catch (e) {
      if (callback) callback();
    }
  }

  useEffect(() => {
    if (!isOpen) return

    let mounted = true
    const readerId = "reader"

    const timer = setTimeout(() => {
      async function startScanner() {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true })

          if (!mounted) return

          const html5QrCode = new Html5Qrcode(readerId, {
            verbose: false,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true // Cela utilise le scanner natif du téléphone (ultra rapide) s'il est supporté
            }
          })
          html5QrCodeRef.current = html5QrCode

          // Configuration optimale pour les codes-barres 1D (très rapide)
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10, // Retour à 10 FPS : donne plus de temps au décodeur pour lire les petites lignes du code-barres
              formatsToSupport: [   // On lui dit de chercher UNIQUEMENT ces formats, ça le rend 10x plus rapide/concentré
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A
              ],
              qrbox: { width: 300, height: 180 }, // Raja3na l'moraba3 w drah kbir (300x180) ysa3ed l'code barre
              disableFlip: false 
            },
            (decodedText) => {
              if (!mounted) return
              mounted = false
              
              stopScannerSafely(() => {
                onScan(decodedText)
                onClose()
              })
            },
            (errorMessage) => {
               // ignore
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
      stopScannerSafely()
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
             stopScannerSafely(onClose)
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
