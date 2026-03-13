function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function t3() {
    await delay(1000); 
    console.log("Ready");
}

t3();
