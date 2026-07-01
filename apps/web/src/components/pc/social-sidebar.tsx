'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export function SocialSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hidden preload — cache images before modal opens */}
      <div aria-hidden="true" className="hidden">
        <img src="/images/qr-douyin.jpg" alt="" />
        <img src="/images/qr-xiaohongshu.jpg" alt="" />
        <img src="/images/qr-zfb.jpg" alt="" />
      </div>

      <div className="fixed right-6 bottom-6 z-[5] flex flex-col items-center gap-3">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-center w-36 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setOpen(true)}>
          <p className="text-[11px] text-slate-500 mb-2 font-bold">扫码关注站长</p>
          <img src="/images/qr-douyin.jpg" alt="抖音" className="w-28 h-auto mx-auto rounded-lg" />
          <p className="text-[10px] text-slate-400 mt-1.5">抖音</p>
        </div>
      </div>

      {/* Fullscreen modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="flex items-start gap-8 p-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors">
              <X size={28} />
            </button>
            <div className="text-center self-end w-[38vh]">
              <img src="/images/qr-douyin.jpg" alt="抖音" className="w-full h-auto rounded-xl shadow-2xl" />
              <p className="text-white text-sm mt-3 font-medium">抖音</p>
            </div>
            <div className="text-center self-end w-[38vh]">
              <img src="/images/qr-xiaohongshu.jpg" alt="小红书" className="w-full h-auto rounded-xl shadow-2xl" />
              <p className="text-white text-sm mt-3 font-medium">小红书</p>
            </div>
            <div className="text-center self-end">
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-xl p-3 shadow-2xl">
                <p className="text-sm text-amber-700 mb-1 font-bold">⚡ 赞助站长</p>
                <p className="text-xs text-slate-400 mb-2 leading-tight">网站目前处于Beta阶段<br/>感谢想赞助的老板</p>
                <img src="/images/qr-zfb.jpg" alt="支付宝" className="w-[32vh] h-auto mx-auto rounded-lg" />
              </div>
              <p className="text-white text-sm mt-3 font-medium">支付宝赞助</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
