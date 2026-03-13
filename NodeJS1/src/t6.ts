async function processInBatches(
    items: number[],
    batchSize: number,
    processor: (batch: number[]) => Promise<number[]>
): Promise<number[]> {
    const results: number[] = [];
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
        const currentBatchNumber = i + 1;
        console.log(`Обробка партії ${currentBatchNumber}/${totalBatches}...`);

        const batch = items.slice(i * batchSize, (i + 1) * batchSize);

        if (i === 0) {
            results.push(...batch);
        } else {
            const processedBatch = await processor(batch);
            results.push(...processedBatch);
        }
    }

    return results;
}

async function testBatchProcessing() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms + 15));

    const processor = async (batch: number[]): Promise<number[]> => {
        await delay(100); 
        return batch.map(n => n * 2);
    };

    const results = await processInBatches(numbers, 3, processor);
    
    console.log("Результат:", results); 
}

testBatchProcessing();