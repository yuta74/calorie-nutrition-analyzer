'use client'

import React, { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Service Worker登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // PWAインストール関連の設定
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    
    setIsIOS(isIOSDevice)
    setIsStandalone(isInStandaloneMode)

    // PWAインストールプロンプトの処理
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // すでにインストール済みまたはiOSでない場合は表示しない
      if (!isInStandaloneMode && !isIOSDevice) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false)
    }
    
    setDeferredPrompt(null)
  }

  const dismissPrompt = () => {
    setShowInstallPrompt(false)
    // 1日後に再表示
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // すでにインストール済みの場合は何も表示しない
  if (isStandalone) {
    return null
  }

  // iOSの場合の手動インストール案内
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">📱 アプリとして追加</h3>
            <p className="text-xs">
              Safariの「共有」ボタン → 「ホーム画面に追加」でアプリのように使えます
            </p>
          </div>
          <button
            onClick={dismissPrompt}
            className="ml-2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  // Androidなどの場合のインストールプロンプト
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">📱 アプリをインストール</h3>
            <p className="text-xs">ホーム画面に追加して、アプリのように使用できます</p>
          </div>
          <div className="flex gap-2 ml-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-500 px-3 py-1 rounded text-xs font-bold hover:bg-gray-100"
            >
              追加
            </button>
            <button
              onClick={dismissPrompt}
              className="text-white hover:text-gray-200 text-xs"
            >
              後で
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}