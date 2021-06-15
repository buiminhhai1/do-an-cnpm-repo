# STAGE: build
FROM node:lts-alpine AS builder
RUN mkdir -p /usr/app
WORKDIR /usr/app

# database
ENV TYPEORM_CONNECTION="postgres"
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_USER=postgres
ENV POSTGRES_DB=postgres
ENV POSTGRES_PORT=5432
ENV POSTGRES_HOST=localhost
ENV DATABASE_URI=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

ENV DEV_TENANT_ID='73e7859d-49e3-4a4f-bff7-9b03df1da0eb'
# other
ENV JWT_SECRET=jwt_secret
ENV NODE_ENV=development
ENV PORT=8000
# google store
ENV GOOGLE_STORAGE_CLIENT_ID=869793815585-jpoio2uln2bhj0qsdrq97447jv2nagrv.apps.googleusercontent.com
ENV GOOGLE_STORAGE_CLIENT_SECRET=Hq2VSqPNd8wdhBRtOgPhPjb_
ENV GOOGLE_STORAGE_REDIRECT_URI=https://developers.google.com/oauthplayground
ENV GOOGLE_STORAGE_REFRESH_TOKEN=1//043EbrPfckazNCgYIARAAGAQSNwF-L9IrvOQJBBR7YSiKbveqwpZ3n57X-doBv6lNSE9cWbJMjeMpmbFwSclLk2wxsIlFBbYQnGQ

COPY package.json tsconfig.json ./

RUN npm install

COPY src src

RUN npm run build \
  && rm -rf src tsconfig.json

# STAGE: run
FROM node:lts-alpine as latest
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY --from=builder /usr/app ./

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
