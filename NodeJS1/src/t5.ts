async function retryOperation(
    operation: () => Promise<unknown>,
    maxRetries: number = 3 
): Promise<unknown> {
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

async function testRetry() {
    let attempts = 0;
    
    const unreliableOperation = async (): Promise<string> => {
        attempts = 1;
        if (attempts < 3) {
            throw new Error('Error');
        }
        return 'Успіх!';
    };

    try {
        const result = await retryOperation(unreliableOperation, 3);
        console.log(result); 
    } catch (error) {
        console.error("Error:", error);
    }
}

testRetry();