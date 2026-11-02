// Largest side of an uploaded photo: plenty for the site, and much lighter to convert on the server
const MAX_SIDE = 2000
// Smaller files are uploaded as they are
const SHRINK_ABOVE_BYTES = 1024 * 1024
// Hosting limits a request to 4.5MB, form data included
const MAX_BYTES = 4 * 1024 * 1024
const QUALITIES = [0.85, 0.7, 0.5]

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))

/**
 * Scales a big photo down in the browser before uploading it. Any problem (a browser or a format
 * it cannot handle) returns the original file, and the server has the last word on it.
 */
export const shrinkImage = async (file: File): Promise<File> => {
  if (file.size <= SHRINK_ABOVE_BYTES) return file

  try {
    // Applies the EXIF rotation, which the JPEG below would otherwise lose
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    if (!context) return file
    // JPEG has no transparency: white is what a transparent PNG looks like on the site
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    for (const quality of QUALITIES) {
      const blob = await toJpeg(canvas, quality)
      if (blob && blob.size <= MAX_BYTES) return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
    }
  } catch (error) {
    console.warn('Could not shrink the image', error)
  }
  return file
}
