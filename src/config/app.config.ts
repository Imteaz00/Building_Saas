export const appConfig = () => {
  return {
    environment: process.env.NODE_ENV || 'prod',
    PORT: process.env.PORT || 3000,
    database: {
      url: process.env.DATABASE_URL,
      synchronize: process.env.SYNCHRONIZE === 'true',
    },
  };
};
