export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3 
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Спроба ${attempt}...`);
        
        try {
            const result = await operation();
            return result; 
        } catch (error) {
            lastError = error; 
            
            if (attempt === maxRetries) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 150));
        }
    }

    throw lastError;
}
