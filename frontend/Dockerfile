FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG API_INTERNAL_URL=http://backend:8000
ENV API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run build && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "start"]
