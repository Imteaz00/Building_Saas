export const appConfig = () => {
  return {
    environment: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3000,
    database: {
      url: process.env.DATABASE_URL,
      synchronize: process.env.SYNCHRONIZE === 'true',
      autoLoadEntities: process.env.AUTO_LOAD_ENTITIES === 'true',
    },
  };
};
