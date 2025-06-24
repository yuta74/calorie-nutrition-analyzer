const fs = require('fs')
const path = require('path')

// SVGベースのアイコンを生成する関数
function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
    <circle cx="${size * 0.5}" cy="${size * 0.35}" r="${size * 0.15}" fill="white" opacity="0.9"/>
    <rect x="${size * 0.2}" y="${size * 0.55}" width="${size * 0.6}" height="${size * 0.25}" rx="${size * 0.05}" fill="white" opacity="0.9"/>
    <text x="${size * 0.5}" y="${size * 0.75}" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="${size * 0.12}" font-weight="bold">🍽️</text>
  </svg>`
}

// 必要なアイコンサイズ
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

// iconsディレクトリが存在しない場合は作成
const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// 各サイズのSVGアイコンを生成
sizes.forEach(size => {
  const svgContent = generateSVGIcon(size)
  const filename = `icon-${size}x${size}.svg`
  const filepath = path.join(iconsDir, filename)
  
  fs.writeFileSync(filepath, svgContent)
  console.log(`Generated: ${filename}`)
})

// Apple Touch Icon
const appleTouchIcon = generateSVGIcon(180)
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon)
console.log('Generated: apple-touch-icon.svg')

// ショートカット用アイコン
const cameraIcon = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="15" fill="#10b981"/>
  <rect x="20" y="30" width="56" height="40" rx="8" fill="white"/>
  <circle cx="48" cy="50" r="12" fill="#10b981"/>
  <rect x="60" y="22" width="16" height="8" rx="4" fill="white"/>
</svg>`

const calendarIcon = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="15" fill="#f59e0b"/>
  <rect x="16" y="24" width="64" height="56" rx="4" fill="white"/>
  <rect x="16" y="24" width="64" height="16" rx="4" fill="#f59e0b"/>
  <line x1="28" y1="16" x2="28" y2="32" stroke="white" stroke-width="3"/>
  <line x1="68" y1="16" x2="68" y2="32" stroke="white" stroke-width="3"/>
</svg>`

fs.writeFileSync(path.join(iconsDir, 'camera-shortcut.svg'), cameraIcon)
fs.writeFileSync(path.join(iconsDir, 'calendar-shortcut.svg'), calendarIcon)

console.log('Generated: camera-shortcut.svg, calendar-shortcut.svg')
console.log('\\n⚠️  Note: SVG icons generated. For better compatibility, convert to PNG using:')
console.log('   npm install -g svg2png-cli')
console.log('   svg2png public/icons/*.svg')

// package.jsonスクリプトの提案
const packageJsonScript = {
  "generate-icons": "node scripts/generate-icons.js",
  "convert-icons": "for file in public/icons/*.svg; do svg2png \"$file\" -o \"${file%.svg}.png\"; done"
}

console.log('\\n📝 Add to package.json scripts:', JSON.stringify(packageJsonScript, null, 2))