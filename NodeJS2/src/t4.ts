export interface UserProfile {
    id: string;
    name: string;
    email: string;
}

export function getUserById(userId: string): Promise<UserProfile> {
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

export function fetchUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) {
        return Promise.resolve([]);
    }

    return Promise.all(userIds.map(getUserById));
}