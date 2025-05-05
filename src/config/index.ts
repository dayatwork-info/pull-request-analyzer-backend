import developmentConfig from './development.config';
import productionConfig from './production.config';
import testConfig from './test.config';

export function getConfig() {
  switch (process.env.NODE_ENV) {
    case 'production':
      return [productionConfig];
    case 'test':
      return [testConfig];
    case 'development':
    default:
      return [developmentConfig];
  }
}

export { developmentConfig, productionConfig, testConfig };