
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --production || yarn install --production || pnpm install --prod
COPY . .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/server.js"]
