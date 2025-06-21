'use client'

import React, { useRef, useState } from 'react'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  isLoading: boolean
}

export default function ImageUpload({ onImageUpload, isLoading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file)
    }
  }

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsCameraOpen(true)
    } catch (error) {
      console.error('カメラアクセスエラー:', error)
      alert('カメラにアクセスできませんでした')
    }
  }

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      context?.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
          onImageUpload(file)
          closeCamera()
        }
      }, 'image/jpeg', 0.8)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {!isCameraOpen ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <button
              onClick={openCamera}
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📸 写真を撮る
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📁 ファイルから選択
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={capturePhoto}
              disabled={isLoading}
              className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📷 撮影
            </button>
            
            <button
              onClick={closeCamera}
              disabled={isLoading}
              className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              ✕ キャンセル
            </button>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}