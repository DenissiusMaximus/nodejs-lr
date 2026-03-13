export interface UserProfile {
    id: string;
    name: string;
    email: string;
}

function getUserById(userId: string): Promise<UserProfile> {
    return new Promise((resolve) => {
        const delayMs = 50 + Math.random() * 100;

        setTimeout(() => {
            const userProfile: UserProfile = {
                id: userId,
                name: `User ${userId}`,
                email: `user_${userId}@test.ua` 
            };
            resolve(userProfile);
        }, delayMs);
    });
}

function fetchUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) {
        return Promise.resolve([]);
    }

    return Promise.all(userIds.map(getUserById));
}

async function runExample() {
    const userIds: string[] = ["1", "2", "3"];
    
    console.time("FetchTime"); 
    const profiles = await fetchUserProfiles(userIds);
    console.timeEnd("FetchTime");

    console.log(profiles);
}

runExample();