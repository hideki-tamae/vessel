# FROM node:20-alpine
# RUN apk add --no-cache openssl libc6-compat python3
# WORKDIR /app
# COPY package*.json ./
# COPY prisma ./prisma/
# RUN npm install && npm install sharp
# COPY . .
# RUN python3 make_assets.py
# ENV NEXT_SHARP_PATH=/app/node_modules/sharp
# RUN npm run build
# EXPOSE 7860
# ENV PORT=7860
# ENV HOST=0.0.0.0
# CMD ["npm", "start"]




FROM node:20-alpine

# 1. 必要なシステムライブラリのインストール
# openssl: Prisma用 / libc6-compat: Next.jsのビルド安定化 / python3: make_assets.py用
RUN apk add --no-cache openssl libc6-compat python3 build-base

WORKDIR /app

# 2. 依存関係のインストール（キャッシュ効率化のため先にコピー）
COPY package*.json ./
COPY prisma ./prisma/

# sharp のインストールと依存関係の解決
RUN npm install
RUN npm install sharp

# 3. ソースコードのコピー
COPY . .

# 資産生成スクリプトの実行（ロゴなどがここで生成・配置される場合）
RUN python3 make_assets.py

# 4. Prisma クライアントの生成
RUN npx prisma generate

# 5. Next.js のビルド
# NEXT_PUBLIC_* はビルド時にクライアントバンドルへ埋め込まれるため、
# --build-arg で渡した値を ENV 経由で npm run build に反映する
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 6. 実行環境の設定
EXPOSE 7860
ENV PORT=7860
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# 実行コマンド
CMD ["npm", "start"]
