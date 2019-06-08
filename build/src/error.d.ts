export interface ErrorMessageInfo {
    code: string;
    value: string;
}
export declare const ErrorMessage: {
    unknown: ErrorMessageInfo;
    param: {
        unknown: ErrorMessageInfo;
        missing: ErrorMessageInfo;
        formatError: ErrorMessageInfo;
    };
    permission: {
        unknown: ErrorMessageInfo;
        missing: ErrorMessageInfo;
        invalid: ErrorMessageInfo;
    };
    token: {
        unknown: ErrorMessageInfo;
        missing: ErrorMessageInfo;
        invalid: ErrorMessageInfo;
    };
    route: {
        unknown: ErrorMessageInfo;
        missing: ErrorMessageInfo;
        invalid: ErrorMessageInfo;
    };
};
