
import { generateMessage } from './utils';

export interface IErrorMessage {
    code: string;
    value: string;
}

export const ErrorMessage = {
    unknown: generateMessage('-1', 'Unknown error!'),
    param: {
        unknown: generateMessage('3000', 'Unknown parameters error!'),
        missing: generateMessage('3001', 'Missing parameters!'),
        formatError: generateMessage('3002', 'Parameters format error!')
    },
    user: {
        unknown: generateMessage('4000', 'unknown'),
        alreadyExist: generateMessage('4001', 'User already exist!'),
        createSuccess: generateMessage('4002', 'User create success!'),
        createFail: generateMessage('4003', 'User create fail!'),
        loginSuccess: generateMessage('4004', 'User login success!'),
        loginFail: generateMessage('4005', 'User login fail!'),
        logoutSuccess: generateMessage('4006', 'User logout success!')
    }
};

