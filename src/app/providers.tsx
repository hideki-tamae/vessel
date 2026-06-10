// 'use client';

// import { SessionProvider } from 'next-auth/react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { useState, type ReactNode } from 'react';
// import { WagmiProvider, http } from 'wagmi';
// import { mainnet, polygon, sepolia } from 'wagmi/chains';
// import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
// import '@rainbow-me/rainbowkit/styles.css';

// const config = getDefaultConfig({
//   appName: 'ACES CARE HUB JAPAN',
//   projectId: '08e0e7b17c58fae4b5a53c4ec8f0a7ca',
//   chains: [mainnet, polygon, sepolia],
//   transports: { [mainnet.id]: http(), [polygon.id]: http(), [sepolia.id]: http() },
//   ssr: true,
// });

// export function Providers({ children }: { children: ReactNode }) {
//   const [queryClient] = useState(() => new QueryClient());
//   return (
//     <SessionProvider>
//       <WagmiProvider config={config} reconnectOnMount={false}>
//         <QueryClientProvider client={queryClient}>
//           <RainbowKitProvider theme={darkTheme()} modalSize="compact" initialChain={sepolia}>
//             {children}
//           </RainbowKitProvider>
//         </QueryClientProvider>
//       </WagmiProvider>
//     </SessionProvider>
//   );
// }

'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'ACES CARE HUB JAPAN',
  projectId: '08e0e7b17c58fae4b5a53c4ec8f0a7ca',
  chains: [mainnet, polygon, sepolia],
  transports: { [mainnet.id]: http(), [polygon.id]: http(), [sepolia.id]: http() },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <WagmiProvider config={config} reconnectOnMount={false}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()} modalSize="compact" initialChain={sepolia}>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}