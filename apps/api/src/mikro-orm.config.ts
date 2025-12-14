import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

const config: Options = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'wasilni',
  password: process.env.DB_PASSWORD || 'wasilni_dev_password',
  dbName: process.env.DB_NAME || 'wasilni',
  entities: ['./dist/database/entities/**/*.js'],
  entitiesTs: ['./src/database/entities/**/*.ts'],
  migrations: {
    path: './dist/database/migrations',
    pathTs: './src/database/migrations',
    tableName: 'mikro_orm_migrations',
    transactional: true,
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV !== 'production',
  allowGlobalContext: true,
  driverOptions: {
    connection: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
  },
};

export default config;
