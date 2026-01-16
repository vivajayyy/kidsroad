/**
 * Telegram Notification Service
 * Cron 실행 결과를 텔레그램으로 전송
 */

export interface CronResult {
  success: boolean;
  message: string;
  totalItems: number;
  processedCount: number;
  enrichedCount: number;
  skippedCount: number;
  errors: string[];
  durationMs: number;
}

/**
 * 텔레그램으로 Cron 실행 결과 전송
 */
export async function sendTelegramNotification(result: CronResult): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // 텔레그램 설정이 없으면 스킵
  if (!botToken || !chatId) {
    console.log('[Telegram] 설정되지 않음, 알림 스킵');
    return;
  }

  const icon = result.success ? '✅' : '❌';
  const durationSec = (result.durationMs / 1000).toFixed(1);
  const costSavingPercent = ((result.skippedCount / result.totalItems) * 100).toFixed(1);

  let message = `${icon} *Kidsroad Cron 실행 완료*\n\n`;
  message += `⏰ 실행 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n`;
  message += `⏱️ 소요 시간: ${durationSec}초\n\n`;
  message += `📊 *결과*\n`;
  message += `• 전체: ${result.totalItems}개\n`;
  message += `• 처리: ${result.processedCount}개\n`;
  message += `• Enrichment: ${result.enrichedCount}개\n`;
  message += `• 스킵: ${result.skippedCount}개\n`;
  message += `• 오류: ${result.errors.length}개\n\n`;
  message += `💰 *비용 절감*: ${costSavingPercent}% (AI 호출 ${result.skippedCount}회 스킵)\n`;

  if (result.errors.length > 0) {
    message += `\n⚠️ *오류 목록*:\n`;
    result.errors.slice(0, 3).forEach((err) => {
      message += `• ${err.substring(0, 100)}\n`;
    });
    if (result.errors.length > 3) {
      message += `... 외 ${result.errors.length - 3}개\n`;
    }
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Telegram] 전송 실패:', errorData);
    } else {
      console.log('[Telegram] 알림 전송 완료');
    }
  } catch (error) {
    console.error('[Telegram] 전송 오류:', error);
  }
}
