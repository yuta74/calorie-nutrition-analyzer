'use client'

import React, { useRef, useState, useEffect } from 'react'

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
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isHTTPS, setIsHTTPS] = useState(true)

  useEffect(() => {
    // クライアントサイドでHTTPS状態を確認
    if (typeof window !== 'undefined') {
      setIsHTTPS(location.protocol === 'https:' || location.hostname === 'localhost')
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file)
    }
  }

  const openCamera = async () => {
    setCameraError(null)
    setIsVideoReady(false)
    
    // HTTPS環境チェック
    if (!isHTTPS) {
      setCameraError('カメラ機能はHTTPS環境でのみ利用できます。')
      return
    }

    // MediaDevicesサポートチェック
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('お使いのブラウザはカメラ機能をサポートしていません。')
      return
    }

    try {
      console.log('カメラアクセスを開始しています...')
      
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('カメラストリーム取得成功:', mediaStream)
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // video要素の準備完了を待つ
        videoRef.current.onloadedmetadata = () => {
          console.log('ビデオメタデータ読み込み完了')
          setIsVideoReady(true)
        }
        
        videoRef.current.oncanplay = () => {
          console.log('ビデオ再生準備完了')
          setIsVideoReady(true)
        }
      }
      
      setIsCameraOpen(true)
      console.log('カメラオープン完了')
      
    } catch (error: any) {
      console.error('カメラアクセスエラー:', error)
      
      let errorMessage = 'カメラにアクセスできませんでした。'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'カメラの使用が許可されていません。ブラウザの設定でカメラアクセスを許可してください。'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'カメラが見つかりませんでした。デバイスにカメラが接続されているか確認してください。'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'カメラが他のアプリケーションで使用中の可能性があります。'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'カメラの設定に問題があります。'
      }
      
      setCameraError(errorMessage)
    }
  }

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraOpen(false)
    setIsVideoReady(false)
    setCameraError(null)
  }

  const capturePhoto = () => {
    if (!isVideoReady) {
      console.warn('ビデオが準備できていません')
      return
    }
    
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      // ビデオサイズを確認
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('ビデオサイズが無効です:', video.videoWidth, video.videoHeight)
        setCameraError('カメラの映像が正常に読み込まれていません。')
        return
      }
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      context?.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
          console.log('写真撮影完了:', file)
          onImageUpload(file)
          closeCamera()
        } else {
          console.error('画像のblob作成に失敗しました')
          setCameraError('写真の保存に失敗しました。')
        }
      }, 'image/jpeg', 0.8)
    } else {
      console.error('Video または Canvas 要素が見つかりません')
      setCameraError('カメラコンポーネントに問題があります。')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* エラーメッセージ表示 */}
      {cameraError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{cameraError}</p>
          <button
            onClick={() => setCameraError(null)}
            className="mt-2 text-red-500 hover:text-red-700 text-sm underline"
          >
            閉じる
          </button>
        </div>
      )}

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
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📁 ファイルから選択
            </button>
          </div>
          
          {/* 使用方法のヒント */}
          <div className="text-sm text-gray-600 text-center">
            <p>📱 カメラで撮影するか、既存の画像を選択してください</p>
            {!isHTTPS && (
              <p className="text-orange-600 mt-1">
                ⚠️ カメラ機能はHTTPS環境でのみ利用可能です
              </p>
            )}
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
              muted
              className="w-full rounded-lg bg-gray-900"
            />
            
            {/* ローディング表示 */}
            {!isVideoReady && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">カメラを準備中...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={capturePhoto}
              disabled={isLoading || !isVideoReady}
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
          
          {/* カメラ状態の表示 */}
          <div className="text-xs text-gray-500 text-center">
            {isVideoReady ? '📹 カメラ準備完了' : '⏳ カメラ準備中...'}
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}