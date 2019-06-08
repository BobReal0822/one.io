"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
exports.ErrorMessage = {
    unknown: utils_1.generateMessage('-1', 'Unknown error!'),
    param: {
        unknown: utils_1.generateMessage('3000', 'Unknown parameter error!'),
        missing: utils_1.generateMessage('3001', 'Missing parameter!'),
        formatError: utils_1.generateMessage('3002', 'Parameter format error!')
    },
    permission: {
        unknown: utils_1.generateMessage('4000', 'Unknown permission error!'),
        missing: utils_1.generateMessage('4001', 'Missing permission!'),
        invalid: utils_1.generateMessage('4002', 'Permission invalid!')
    },
    token: {
        unknown: utils_1.generateMessage('5000', 'Unknown token error!'),
        missing: utils_1.generateMessage('5001', 'Missing token!'),
        invalid: utils_1.generateMessage('5002', 'token invalid!')
    },
    route: {
        unknown: utils_1.generateMessage('6000', 'Unknown route error!'),
        missing: utils_1.generateMessage('6001', 'Missing route!'),
        invalid: utils_1.generateMessage('6002', 'Route invalid!')
    }
};
//# sourceMappingURL=error.js.map