// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options"; // 分離した設定をインポート

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };