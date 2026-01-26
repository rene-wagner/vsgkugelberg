export class Timer {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  elapsed(): string {
    return ((Date.now() - this.startTime) / 1000).toFixed(2);
  }

  elapsedMs(): number {
    return Date.now() - this.startTime;
  }
}
