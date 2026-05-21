import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "../globals.css";

const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], weight: ["300","400","500","600","700"], style: ["normal","italic"], variable: "--font-cormorant" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-jetbrains" });
const notoSansSc = Noto_Sans_SC({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-noto-sans-sc" });
const notoSerifSc = Noto_Serif_SC({ subsets: ["latin"], weight: ["300","400","500","700","900"], variable: "--font-noto-serif-sc" });

export const metadata: Metadata = {
  title: "Horizon — 锁定你的自由之日",
  description: "把复杂的退休规则变成极简方案",
};

export default function CNLayout({ children }: { children: React.ReactNode }) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${cormorantGaramond.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${notoSansSc.variable} ${notoSerifSc.variable}`}>
        {clerkPublishableKey ? <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}
