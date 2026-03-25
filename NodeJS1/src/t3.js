"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t3 = t3;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function t3() {
    await delay(1000);
    console.log("Ready");
}
t3();
//# sourceMappingURL=t3.js.map