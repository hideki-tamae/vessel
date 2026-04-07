// src/app/policy/en/page.tsx

'use client'; 

import React from "react";
import AntiCopyWrapper from "../../../components/utils/AntiCopyWrapper";
import Link from 'next/link'; 
import Image from 'next/image';

const PolicyEnPage = () => {
  // 画像パスの定義（publicを除いたルートパスを指定）
  const images = {
    cover: "/images/En0.png",
    page1: "/images/En1.png",
    page2: "/images/En2.png",
    page3: "/images/En3.png",
    page4: "/images/En4.png",
  };

  return (
    <div className="min-h-screen py-16 md:py-24 bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 lg:px-0">
        
        {/* --- ヘッダー --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-orange-400 mb-2">
            Policy Paper (政策提言書)
          </h1>
          <p className="text-xl text-gray-400">English Version / View Only - Copyright Protected</p>
          
          <div className="mt-4 mb-4 text-center">
              <Link href="/policy">
                  <span className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer border-b border-gray-600 hover:border-white">
                      ← View Japanese Version
                  </span>
              </Link>
          </div>

          <div className="mt-8">
            <h3 className="text-lg text-red-500 font-bold">
              PDF download has been disabled. <br/>The content below is view-only and protected against copying.
            </h3>
          </div>
        </div>

        {/* --- コンテンツ --- */}
        <AntiCopyWrapper>
          <div className="space-y-12">
            
            {/* Cover */}
            <h2 className="text-3xl font-bold text-white pt-10 border-t border-red-700">Cover</h2>
            <div className="relative w-full aspect-[1/1.414]"> {/* A4比率の維持 */}
              <Image 
                src={images.cover} 
                alt="Policy Cover Page" 
                fill
                className="object-contain rounded-xl shadow-2xl border border-white/10" 
                priority
              />
            </div>

            {/* Page 1 */}
            <h2 className="text-3xl font-bold text-white pt-10 border-t border-red-700">Page 1 (Introduction/Challenge)</h2>
            <div className="relative w-full aspect-[1/1.414]">
              <Image 
                src={images.page1} 
                alt="Policy Page 1" 
                fill
                className="object-contain rounded-xl shadow-2xl border border-white/10" 
              />
            </div>
            
            {/* Page 2 */}
            <h2 className="text-3xl font-bold text-white pt-10 border-t border-red-700">Page 2 (Tech/Scientific Basis)</h2>
            <div className="relative w-full aspect-[1/1.414]">
              <Image 
                src={images.page2} 
                alt="Policy Page 2" 
                fill
                className="object-contain rounded-xl shadow-2xl border border-white/10" 
              />
            </div>

            {/* Page 3 */}
            <h2 className="text-3xl font-bold text-white pt-10 border-t border-red-700">Page 3 (Resilience/Economic Rationality)</h2>
            <div className="relative w-full aspect-[1/1.414]">
              <Image 
                src={images.page3} 
                alt="Policy Page 3" 
                fill
                className="object-contain rounded-xl shadow-2xl border border-white/10" 
              />
            </div>

            {/* Page 4 */}
            <h2 className="text-3xl font-bold text-white pt-10 border-t border-red-700">Page 4 (Roadmap/Conclusion)</h2>
            <div className="relative w-full aspect-[1/1.414]">
              <Image 
                src={images.page4} 
                alt="Policy Page 4" 
                fill
                className="object-contain rounded-xl shadow-2xl border border-white/10" 
              />
            </div>

          </div>
        </AntiCopyWrapper>

        <div className="text-center mt-12 text-sm text-gray-600">
          <p>Copyright © 2025 ACEs CARE HUB JAPAN. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
};

export default PolicyEnPage;