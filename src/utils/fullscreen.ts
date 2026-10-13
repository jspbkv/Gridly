// Android Fullscreen & Immersive Mode Manager

export interface FullscreenElementWithWebkit extends HTMLElement {
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

export interface DocumentWithWebkit extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

export function isFullscreen(): boolean {
  const doc = document as DocumentWithWebkit;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

export async function requestFullscreenImmersive(): Promise<boolean> {
  const elem = document.documentElement as FullscreenElementWithWebkit;

  try {
    if (elem.requestFullscreen) {
      await elem.requestFullscreen({ navigationUI: 'hide' });
    } else if (elem.webkitRequestFullscreen) {
      await elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      await elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      await elem.msRequestFullscreen();
    }

    // Try locking screen orientation to portrait on Android Chrome
    try {
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>;
      };
      if (orientation?.lock) {
        await orientation.lock('portrait');
      }
    } catch {
      // Screen orientation lock may require installed PWA or is unsupported, safely ignore
    }

    return true;
  } catch (err) {
    // User or browser may prevent auto-fullscreen without explicit gesture
    console.warn('Fullscreen request bypassed:', err);
    return false;
  }
}

export async function exitFullscreenImmersive(): Promise<boolean> {
  const doc = document as DocumentWithWebkit;
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
    }
    return true;
  } catch {
    return false;
  }
}
