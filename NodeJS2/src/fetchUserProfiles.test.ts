import { delay } from "./t3";
import { fetchUserProfiles, getUserById } from "./t4";
import { retryOperation } from "./t5";
import { processInBatches } from "./t6";
import { raceWithTimeout } from "./t7";

describe('fetchUserProfiles()', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should fetch user profiles for given user IDs', async () => {
        const userIds = ['1', '2'];
        
        const fetchPromise = fetchUserProfiles(userIds);
        await jest.advanceTimersByTimeAsync(200);

        const profiles = await fetchPromise;

        expect(profiles).toEqual([
            { id: '1', name: 'User 1', email: 'user_1@test.ua' },
            { id: '2', name: 'User 2', email: 'user_2@test.ua' }
        ]);
    });

    it('if userIds is empty, should return an empty array', async () => {
        const profiles = await fetchUserProfiles([]);
        
        expect(profiles).toEqual([]);
    });

    it('should return correct object structure and properties', async () => {
        const fetchPromise = fetchUserProfiles(['99']);
        
        await jest.advanceTimersByTimeAsync(200);
        const profiles = await fetchPromise;

        expect(profiles).toHaveLength(1);
        
        expect(profiles[0]).toHaveProperty('id', '99');
        expect(profiles[0]).toHaveProperty('name', 'User 99');
        expect(profiles[0]).toHaveProperty('email', 'user_99@test.ua');
    });
});