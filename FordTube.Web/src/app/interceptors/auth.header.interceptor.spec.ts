import { AuthHeaderInterceptor } from './auth.header.interceptor';

describe('AuthHeaderInterceptor', () => {
  let service: AuthHeaderInterceptor;

  beforeEach(() => {
    service = new AuthHeaderInterceptor();
  });

  it('works', () => {
    expect(1).toEqual(2);
  });
});
