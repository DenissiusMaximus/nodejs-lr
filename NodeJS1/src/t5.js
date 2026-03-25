"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t5 = t5;
async function retryOperation(operation, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Спроба ${attempt}...`);
        try {
            const result = await operation();
            return result;
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 150));
        }
    }
    throw lastError;
}
async function t5() {
    let attempts = 0;
    const operation = async () => {
        attempts++;
        if (attempts < 3) {
            throw new Error('Error');
        }
        return 'Успіх!';
    };
    try {
        const result = await retryOperation(operation, 3);
        console.log(result);
    }
    catch (error) {
        console.error("Error:", error);
    }
}
t5();
//# sourceMappingURL=t5.js.map