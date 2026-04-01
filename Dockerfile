FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat python3
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install && npm install sharp
COPY . .
RUN python3 make_assets.py
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
RUN npm run build
EXPOSE 7860
ENV PORT=7860
ENV HOST=0.0.0.0
CMD ["npm", "start"]
