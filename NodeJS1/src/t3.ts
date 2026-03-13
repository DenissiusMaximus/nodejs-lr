function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDelay() {
    await delay(1000); 
    console.log("Ready");
}

testDelay();
