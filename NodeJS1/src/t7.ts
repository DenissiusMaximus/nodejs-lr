function raceWithTimeout(
    promise: Promise<unknown>,
    timeoutMs: number
): Promise<unknown> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            const err = new Error(`Operation timed out after ${timeoutMs}ms`);
            (err as any).timeoutMs = timeoutMs;
            reject(err);
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}

export async function t7() {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms + 15));

    console.log("Тест 1: Швидка операція");
    const fast = delay(50).then(() => 'Готово');
    const result1 = await raceWithTimeout(fast, 100);
    console.log("Результат 1:", result1); 

    console.log("Тест 2: Повільна операція");
    const slow = delay(200).then(() => 'Готово');
    try {
        await raceWithTimeout(slow, 100);
    } catch (err) {
        if (err instanceof Error) {
            console.error("Помилка:", err.message); 
            console.error("Кастомне поле timeoutMs:", (err as any).timeoutMs); 
        }
    }
}

t7();
