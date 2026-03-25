"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t7 = t7;
function raceWithTimeout(promise, timeoutMs) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            const err = new Error(`Operation timed out after ${timeoutMs}ms`);
            err.timeoutMs = timeoutMs;
            reject(err);
        }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
}
async function t7() {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms + 15));
    console.log("Тест 1: Швидка операція");
    const fast = delay(50).then(() => 'Готово');
    const result1 = await raceWithTimeout(fast, 100);
    console.log("Результат 1:", result1);
    console.log("Тест 2: Повільна операція");
    const slow = delay(200).then(() => 'Готово');
    try {
        await raceWithTimeout(slow, 100);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Помилка:", err.message);
            console.error("Кастомне поле timeoutMs:", err.timeoutMs);
        }
    }
}
t7();
//# sourceMappingURL=t7.js.map