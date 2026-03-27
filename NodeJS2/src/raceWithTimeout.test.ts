import { raceWithTimeout } from "./t7";

function createDelayedPromise<T>(value: T, delayMs: number): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(value), delayMs);
    });
}

describe("raceWithTimeout()", () => {
    beforeEach(() => {
        jest.useFakeTimers(); 
    });

    afterEach(() => {
        jest.useRealTimers(); 
    });

    it("should resolve with the promise value if it completes before the timeout", async () => {
        const fastPromise = createDelayedPromise("Дані отримано", 100);

        const racePromise = raceWithTimeout(fastPromise, 500);

        await jest.advanceTimersByTimeAsync(100);

        const result = await racePromise;

        expect(result).toBe("Дані отримано");
    });

    it("should reject with a timeout error if the promise takes too long", async () => {
        const slowPromise = createDelayedPromise("Занадто повільно", 1000);

        const racePromise = raceWithTimeout(slowPromise, 500);

        const assertion = expect(racePromise).rejects.toThrow("Operation timed out after 500ms");

        await jest.advanceTimersByTimeAsync(500);

        await assertion;
    });
});