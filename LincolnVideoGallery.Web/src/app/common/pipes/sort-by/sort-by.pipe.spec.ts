import { SortByPipe } from './sort-by.pipe';

describe('SortByPipe', () => {
    let pipe: SortByPipe;

    beforeEach(() => {
        pipe = new SortByPipe();
    });

    it('transforms X to Y', () => {
        const value: any = 'X';
        const args: string[] = [];

        expect(pipe.transform(value, args)).toEqual('Y');
    });

});
