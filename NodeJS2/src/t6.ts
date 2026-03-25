export async function processInBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
    const results: R[] = [];
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