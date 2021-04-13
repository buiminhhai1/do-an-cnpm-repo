module.exports = {
  apps: [
    {
      name: 'server',
      script: './dist/main.js',
      // passing env for instance
      env: {
        NODE_ENV: 'development',
        REDIS_HOST: '3.0.95.43',
        REDIS_PORT: '6379',
        PGUSER: 'postgres',
        PGHOST: '3.0.95.43',
        PGDATABASE: 'postgres',
        PGPASSWORD: 'password',
        PGPORT: 5432,
        PORT: 8000,
      },
      env_production: {
        TYPEORM_CONNECTION: 'postgres',
        POSTGRES_PASSWORD: 'password',
        POSTGRES_USER: 'postgres',
        POSTGRES_DB: 'postgres',
        POSTGRES_PORT: 5432,
        POSTGRES_HOST: '3.0.95.43',
        DATABASE_URI: 'postgres://postgres:password@3.0.95.43:5432/postgres',
        DEV_TENANT_ID: '73e7859d-49e3-4a4f-bff7-9b03df1da0eb',
        JWT_SECRET: 'jwt_secret',
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
  ],
};
