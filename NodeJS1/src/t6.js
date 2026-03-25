"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t6 = t6;
async function processInBatches(items, batchSize, processor) {
    const results = [];
    const totalBatches = Math.ceil(items.length / batchSize);
    for (let i = 0; i < totalBatches; i++) {
        const currentBatchNumber = i + 1;
        console.log(`Обробка партії ${currentBatchNumber}/${totalBatches}...`);
        const batch = items.slice(i * batchSize, (i + 1) * batchSize);
        const processedBatch = await processor(batch);
        results.push(...processedBatch);
    }
    return results;
}
async function t6() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms + 15));
    const processor = async (batch) => {
        await delay(100);
        return batch.map(n => n * 2);
    };
    const results = await processInBatches(numbers, 3, processor);
    console.log("Результат:", results);
}
t6();
//# sourceMappingURL=t6.js.map