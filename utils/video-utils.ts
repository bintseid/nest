/**
 * Video utility functions for handling video format compatibility
 */

export interface VideoFormatInfo {
  format: string
  codec: string
  mimeType: string
  browserSupport: string
}

export const SUPPORTED_VIDEO_FORMATS: VideoFormatInfo[] = [
  {
    format: 'MP4',
    codec: 'H.264',
    mimeType: 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"',
    browserSupport: 'Excellent'
  },
  {
    format: 'MP4',
    codec: 'Generic',
    mimeType: 'video/mp4',
    browserSupport: 'Good'
  },
  {
    format: 'WebM',
    codec: 'VP8/VP9',
    mimeType: 'video/webm',
    browserSupport: 'Good'
  }
]

/**
 * Check if the browser supports a specific video format
 */
export function checkVideoSupport(video: HTMLVideoElement, mimeType: string): string {
  return video.canPlayType(mimeType)
}

/**
 * Get the best supported video format for the current browser
 */
export function getBestSupportedFormat(video: HTMLVideoElement): VideoFormatInfo | null {
  for (const format of SUPPORTED_VIDEO_FORMATS) {
    const support = video.canPlayType(format.mimeType)
    if (support === 'probably' || support === 'maybe') {
      return format
    }
  }
  return null
}

/**
 * Validate video metadata and return diagnostic information
 */
export function validateVideoMetadata(video: HTMLVideoElement): {
  isValid: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  // Check duration
  if (isNaN(video.duration) || video.duration === 0) {
    issues.push('Invalid or zero duration')
    recommendations.push('Check if video file is complete and not corrupted')
  }

  // Check dimensions
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    issues.push('Invalid video dimensions')
    recommendations.push('Video may be corrupted or in unsupported format')
  }

  // Check ready state
  if (video.readyState < 1) {
    issues.push('Video metadata not loaded')
    recommendations.push('Check network connection and video file accessibility')
  }

  // Check network state
  if (video.networkState === 3) { // NETWORK_NO_SOURCE
    issues.push('No video source found')
    recommendations.push('Verify video URL and file existence')
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  }
}

/**
 * Generate FFmpeg command suggestions for proper MP4 conversion
 * This helps backend developers convert AVI files to browser-compatible MP4
 */
export function getFFmpegConversionSuggestions(): string[] {
  return [
    '// Convert AVI to browser-compatible MP4:',
    'ffmpeg -i input.avi -c:v libx264 -c:a aac -movflags +faststart -preset fast output.mp4',
    '',
    '// For better compatibility:',
    'ffmpeg -i input.avi -c:v libx264 -profile:v baseline -level 3.0 -c:a aac -b:a 128k -movflags +faststart output.mp4',
    '',
    '// For web streaming optimization:',
    'ffmpeg -i input.avi -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart -f mp4 output.mp4'
  ]
}

