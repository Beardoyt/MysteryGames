/* Real artwork, when present, replaces the procedural drawings.
   Drop files into src/games/night-clerk/art/ named after the keys below
   (e.g. cam-walkway.jpg, cut-highway.jpg). Missing files fall back to the
   drawn placeholder, so the game always works. */

const files = import.meta.glob('../art/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

const URLS: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.(jpe?g|png|webp)$/, '')
  URLS[name] = url
}

const cache: Record<string, HTMLImageElement> = {}
const waiting: Record<string, Promise<void>> = {}

export const hasArt = (key: string) => key in URLS

/** start downloading every picture so scenes never wait */
export const preloadAllArt = () => Promise.all(Object.keys(URLS).map(loadArt))

/** Returns the image if it is loaded, otherwise null (and starts loading it). */
export function art(key: string): HTMLImageElement | null {
  if (!URLS[key]) return null
  const img = cache[key]
  if (img?.complete && img.naturalWidth) return img
  void loadArt(key)
  return null
}

export function loadArt(key: string): Promise<void> {
  if (!URLS[key]) return Promise.resolve()
  if (!waiting[key]) {
    waiting[key] = new Promise((res) => {
      const img = new Image()
      img.onload = () => res()
      img.onerror = () => res()
      img.src = URLS[key]
      cache[key] = img
    })
  }
  return waiting[key]
}

/** Draw an image filling the canvas (cropping the edges if the shape differs). */
export function drawCover(c: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const r = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * r, dh = img.naturalHeight * r
  c.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

/**
 * Where the clue details sit in each real image, in 320x240 canvas pixels.
 * These are set once the real images exist; the zoom tool and overlays use them.
 */
export const SPOTS: {
  figureTag?: { x: number; y: number }
  dashPass?: { x: number; y: number }
  door14?: { x: number; y: number }
  rajuAtCar?: { x: number; y: number }
  signText?: { x: number; y: number; size: number }
} = {
  figureTag: { x: 256, y: 130 },
  dashPass: { x: 186, y: 126 },
  door14: { x: 236, y: 72 },
  rajuAtCar: { x: 132, y: 142 },
  signText: { x: 155, y: 85, size: 30 },
}

/** cutaways without their own picture reuse a related one */
const REUSE: Record<string, string> = { police: 'cam-lot-car', walkway: 'cam-walkway', tape: 'cut-door14', key: 'cut-cabinet' }
export const cutArtKey = (id: string) => (hasArt('cut-' + id) ? 'cut-' + id : REUSE[id] ?? 'cut-' + id)
