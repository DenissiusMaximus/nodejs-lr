export function raceWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            const err = new Error(`Operation timed out after ${timeoutMs}ms`);
            (err as any).timeoutMs = timeoutMs;
            reject(err);
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}