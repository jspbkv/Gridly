// Haptics / Vibration Engine for Android
class HapticsEngine {
  public enabled: boolean = true;

  private isVibrationSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  public vibrate(pattern: number | number[]) {
    if (!this.enabled || !this.isVibrationSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }

  // Light tap on picking up or button click
  public tapLight() {
    this.vibrate(10);
  }

  // Firm tactile snap when placing a block
  public tapPlace() {
    this.vibrate(22);
  }

  // Crisp pulse when clearing lines
  public lineClear(linesCount: number) {
    if (linesCount > 1) {
      this.vibrate([25, 30, 45]);
    } else {
      this.vibrate(35);
    }
  }

  // High combo pulse pattern
  public combo() {
    this.vibrate([30, 30, 40, 30, 60]);
  }

  // Game over vibration
  public gameOver() {
    this.vibrate([60, 60, 100]);
  }
}

export const haptics = new HapticsEngine();
