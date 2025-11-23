interface AppConfig {
  name: string;
  url: string;
  frontendUrl: string;
  port: number;
}

interface Config {
  app: AppConfig;
}

const config: Config = {
  app: {
    name: 'Plataforma de Formação',
    url: process.env.APP_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    port: Number(process.env.PORT) || 3000
  }
};

export default config;
