import { HeaderSearchService } from './header-search.service';

describe('HeaderSearchService',
  () => {
    let service: HeaderSearchService;

    beforeEach(() => {
      service = new HeaderSearchService();
    });

    it('works',
      () => {
        expect(1).toEqual(2);
      });
  });
