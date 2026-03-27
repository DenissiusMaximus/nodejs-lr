import { processInBatches } from "./t6";

async function numberProcessor(batch: number[]): Promise<number[]> {
    return batch.map(num => num * 2);
}

async function stringProcessor(batch: string[]): Promise<string[]> {
    return batch;
}

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

    it("should return a correct array of results", async () => {
        const items = [1, 2, 3, 4, 5];

        const result = await processInBatches(items, 2, numberProcessor);

        expect(result).toEqual([2, 4, 6, 8, 10]);
    });

    it("should call console.log the correct number of times", async () => {
        const items = ['a', 'b', 'c']; 

        await processInBatches(items, 2, stringProcessor);

        expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it("should return an empty array if an empty array is passed as input", async () => {
        const items: number[] = [];
        const emptyProcessor = jest.fn().mockResolvedValue([]);

        const result = await processInBatches(items, 2, emptyProcessor);

        expect(result).toEqual([]);
        expect(emptyProcessor).not.toHaveBeenCalled(); 
        expect(consoleSpy).not.toHaveBeenCalled();
    });
});