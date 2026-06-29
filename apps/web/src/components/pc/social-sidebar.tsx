'use client';

export function SocialSidebar() {
  return (
    <div className="fixed right-6 top-1/4 z-[5] flex flex-col items-center gap-4">
      {/* 抖音 */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-center w-36">
        <p className="text-[11px] text-slate-500 mb-2">扫码关注站长</p>
        <img src="/images/qr-douyin.png" alt="抖音" className="w-28 h-28 mx-auto rounded-lg" />
        <p className="text-[10px] text-slate-400 mt-1.5">抖音</p>
      </div>

      {/* 小红书 */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-center w-36">
        <img src="/images/qr-xiaohongshu.png" alt="小红书" className="w-28 h-28 mx-auto rounded-lg" />
        <p className="text-[10px] text-slate-400 mt-1.5">小红书</p>
      </div>
    </div>
  );
}
