FROM --platform=linux/amd64 node:18-alpine as BUILD_IMAGE
WORKDIR /app/react-app

ARG CHAIN_ID

ENV PUBLIC_CHAIN_ID=${CHAIN_ID}

COPY package.json .

RUN npm install -g npm@latest
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM --platform=linux/amd64 node:18-alpine as PRODUCTION_IMAGE
WORKDIR /app/react-app

COPY --from=BUILD_IMAGE /app/react-app/dist/ /app/react-app/dist/
EXPOSE 3000
COPY package.json .
COPY vite.config.ts .

RUN npm install typescript --force

EXPOSE 3000
CMD ["npm", "run", "dev"]
