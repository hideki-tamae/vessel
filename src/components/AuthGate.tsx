// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAccount } from 'wagmi';
// import { ConnectButton } from '@rainbow-me/rainbowkit';

// export function AuthGate({ children }: { children: React.ReactNode }) {
//   const { isConnected } = useAccount();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return <div className="py-20 text-center text-gray-500 animate-pulse">Loading System...</div>;
//   }

//   // ✅ 認証済みなら中身（証拠提出画面）を表示
//   if (isConnected) {
//     return <>{children}</>;
//   }

//   // 🔒 未認証ならロック画面を表示
//   return (
//     <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-10 md:p-16 text-center group">
//       {/* 背景装飾 */}
//       <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
//         <svg className="w-64 h-64 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//         </svg>
//       </div>

//       <div className="relative z-10 flex flex-col items-center gap-6">
//         <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.1)] group-hover:shadow-[0_0_50px_rgba(34,211,238,0.2)] transition-all duration-500">
//           <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//           </svg>
//         </div>
        
//         <div className="space-y-3 max-w-lg">
//           <h3 className="text-2xl font-bold text-white tracking-wide">
//             Access Restricted
//           </h3>
//           <p className="text-gray-400 leading-relaxed">
//             証拠を提出し、優しさを証明するには<br className="hidden md:block"/>
//             <span className="text-cyan-200">Re-Verse ID</span>（顔認証 / Passkeys）による接続が必要です。
//           </p>
//         </div>

//         <div className="mt-4 scale-110">
//           <ConnectButton label="IDを接続して解除" accountStatus="avatar" showBalance={false} />
//         </div>
        
//         <p className="text-xs text-gray-600 mt-6 tracking-wider font-mono">
//           SECURE CHANNEL REQUIRED
//         </p>
//       </div>
//     </div>
//   );
// }


// src/components/AuthGate.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      // セッション読み込み中は何も表示しないか、ローディングスピナーを表示
      return;
    }

    // セッションがない場合、ログインページにリダイレクト
    if (!session) {
      router.push('/auth/signin'); // NextAuth.jsのサインインページパス
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    // ローディング中または未認証の場合は、コンテンツを表示しない
    // 必要に応じてローディングUIをここに配置
    return <div className="flex items-center justify-center min-h-screen text-white">Loading authentication...</div>;
  }

  // 認証済みの場合のみ子コンポーネントを表示
  return <>{children}</>;
};

export default AuthGate;