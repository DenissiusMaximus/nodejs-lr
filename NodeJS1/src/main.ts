import { t3 as delay } from "./t3";
import { t4 as fetchUserProfiles } from "./t4";
import { t5 as retryOperation } from "./t5";
import { t6 as processInBatches } from "./t6";
import { t7 as raceWithTimeout } from "./t7";

async function main() {
    await delay();
    await fetchUserProfiles();
    await retryOperation();
    await processInBatches();
    await raceWithTimeout();
}

main();