"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t4 = t4;
function getUserById(userId) {
    return new Promise((resolve) => {
        const delayMs = 50 + Math.random() * 100;
        setTimeout(() => {
            const userProfile = {
                id: userId,
                name: `User ${userId}`,
                email: `user_${userId}@test.ua`
            };
            resolve(userProfile);
        }, delayMs);
    });
}
function fetchUserProfiles(userIds) {
    if (userIds.length === 0) {
        return Promise.resolve([]);
    }
    return Promise.all(userIds.map(getUserById));
}
async function t4() {
    const userIds = ["1", "2", "3"];
    console.time("FetchTime");
    const profiles = await fetchUserProfiles(userIds);
    console.timeEnd("FetchTime");
    console.log(profiles);
}
t4();
//# sourceMappingURL=t4.js.map