/**
 * Rate Limiter Utility
 * API 호출 속도 제한을 관리하기 위한 유틸리티
 */

export class RateLimiter {
  private lastCallTime: number = 0;
  private minInterval: number;

  /**
   * @param maxCallsPerSecond 초당 최대 호출 횟수
   */
  constructor(maxCallsPerSecond: number) {
    this.minInterval = 1000 / maxCallsPerSecond;
  }

  /**
   * API 호출 전 호출하여 rate limit을 준수
   */
  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < this.minInterval) {
      const delay = this.minInterval - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastCallTime = Date.now();
  }

  /**
   * 마지막 호출 시간 초기화
   */
  reset(): void {
    this.lastCallTime = 0;
  }
}
