"use client";

export default function ShareButton({ title, contentid }: { title: string; contentid: string }) {
  const handleShare = async () => {
    const url = `${window.location.origin}/events/${contentid}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-12 h-12 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-button hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      aria-label="공유하기"
    >
      <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">share</span>
    </button>
  );
}
