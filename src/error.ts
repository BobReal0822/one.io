
import { generateMessage } from './utils';

export interface ErrorMessageInfo {
    code: string;
    value: string;
}

export const ErrorMessage = {
    unknown: generateMessage('-1', 'Unknown error!'),
    param: {
        unknown: generateMessage('3000', 'Unknown parameter error!'),
        missing: generateMessage('3001', 'Missing parameter!'),
        formatError: generateMessage('3002', 'Parameter format error!')
    },
    permission: {
        unknown: generateMessage('4000', 'Unknown permission error!'),
        missing: generateMessage('4001', 'Missing permission!'),
        invalid: generateMessage('4002', 'Permission invalid!')
    },
    tocken: {
        unknown: generateMessage('5000', 'Unknown tocken error!'),
        missing: generateMessage('5001', 'Missing tocken!'),
        invalid: generateMessage('5002', 'Tocken invalid!')
    },
    route: {
        unknown: generateMessage('6000', 'Unknown route error!'),
        missing: generateMessage('6001', 'Missing route!'),
        invalid: generateMessage('6002', 'Route invalid!')
    }
};

