import { processInBatches } from "./t6";

describe('processInBatches()', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        consoleSpy.mockRestore();
    });

    it('should return a correct array of results', async () => {
        const items = [1, 2, 3, 4, 5];
        const batchSize = 2;

        const processor = async (batch: number[]) => batch.map(num => num * 2);

        const result = await processInBatches(items, batchSize, processor);

        expect(result).toEqual([2, 4, 6, 8, 10]);
    });

    it('should call console.log the correct number of times', async () => {
        const items = ['a', 'b', 'c']; 
        const batchSize = 2;
        const processor = async (batch: string[]) => batch;

        await processInBatches(items, batchSize, processor);

        expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should return an empty array if an empty array is passed as input', async () => {
        const items: number[] = [];
        const processor = jest.fn().mockResolvedValue([]);

        const result = await processInBatches(items, 2, processor);

        expect(result).toEqual([]);
        expect(processor).not.toHaveBeenCalled(); 
        expect(consoleSpy).not.toHaveBeenCalled();
    });
});