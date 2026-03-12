FROM node:18-alpine
WORKDIR /app
COPY scaffolder-service/package.json scaffolder-service/package-lock.json* ./
RUN npm install --omit-dev
COPY scaffolder-service/ .
EXPOSE 4000
CMD ["node", "src/index.js"]
