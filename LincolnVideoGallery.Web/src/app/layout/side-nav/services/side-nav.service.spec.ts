import { SideNavService } from './side-nav.service';

describe('SideNavService',
  () => {
    let service: SideNavService;

    beforeEach(() => {
      service = new SideNavService();
    });

    it('works',
      () => {
        expect(1).toEqual(2);
      });
  });
