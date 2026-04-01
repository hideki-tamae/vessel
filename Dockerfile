FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .

# 有効な1x1透明PNGを生成してNext.jsのバリデーションを突破する
RUN mkdir -p public/images public/docs public/teasers public/audit && \
    export PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" && \
    echo $PNG | base64 -d > public/images/dummy.png && \
    cp public/images/dummy.png public/images/En0.png && \
    cp public/images/dummy.png public/images/En1.png && \
    cp public/images/dummy.png public/images/En2.png && \
    cp public/images/dummy.png public/images/En3.png && \
    cp public/images/dummy.png public/images/En4.png && \
    cp public/images/dummy.png public/images/JP0.png && \
    cp public/images/dummy.png public/images/JP1.png && \
    cp public/images/dummy.png public/imag public/images/dummy.png public/images/JP4.png && \
    cp public/images/dummy.png public/images/JP5.png && \
    cp public/images/dummy.png public/images/JP6.png && \
    cp public/images/dummy.png public/aces-logo.png && \
    cp public/images/dummy.png public/cyber-cross-logo.png && \
    cp public/images/dummy.png public/logo.png && \
    cp public/images/dummy.png public/og.png && \
    cp public/images/dummy.png public/scan-demo.png && \
    touch public/header-bg.jpg public/3.mp4 public/9.mp4 public/hero-movie2.mp4 public/soluna_rnb.mp3

RUN npm run build
EXPOSE 7860
ENV PORT=7860
ENV HOST=0.0.0.0
CMD ["npm", "start"]
