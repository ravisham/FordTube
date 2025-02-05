import { NameAbbreviatedPipe } from './name-abbreviated.pipe';

describe('NameAbbreviatedPipe',
  () => {
    it('create an instance',
      () => {
        const pipe = new NameAbbreviatedPipe();
        expect(pipe).toBeTruthy();
      });
  });
