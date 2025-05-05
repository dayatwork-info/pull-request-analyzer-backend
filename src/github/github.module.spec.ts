import { GitHubModule } from './github.module';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';

describe('GitHubModule', () => {
  it('should be defined', () => {
    expect(GitHubModule).toBeDefined();
  });

  it('should include GitHubService as a provider', () => {
    const providers = Reflect.getMetadata('providers', GitHubModule);
    expect(providers).toContain(GitHubService);
  });

  it('should include GitHubController as a controller', () => {
    const controllers = Reflect.getMetadata('controllers', GitHubModule);
    expect(controllers).toContain(GitHubController);
  });

  it('should export GitHubService', () => {
    const exports = Reflect.getMetadata('exports', GitHubModule);
    expect(exports).toContain(GitHubService);
  });
});
