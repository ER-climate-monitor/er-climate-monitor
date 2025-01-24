// Fields for values inside the request body
const USER_EMAIL_FIELD = 'userEmail';
const USER_PASSWORD_FIELD = 'userPassword';
const USER_JWT_TOKEN_FIELD = 'userToken';
const USER_JWT_TOKEN_EXPIRATION_FIELD = 'userTokenExpiration';
const USER_ACTION_FIELD = 'action';
const USER_ROLE_FIELD = 'userRole';
const ERROR_FIELD = 'error';

const USER_TOKEN_HEADER = 'x-user-token';
const API_KEY_HEADER = 'x-api-key'

// User roles
const NORMAL_USER = 'normal';
const ADMIN_USER = 'admin';

// HTTP header constants
const ERROR_HEADER = 'x-error-message';

export {
    USER_EMAIL_FIELD,
    USER_PASSWORD_FIELD,
    USER_JWT_TOKEN_FIELD,
    USER_JWT_TOKEN_EXPIRATION_FIELD,
    NORMAL_USER,
    ADMIN_USER,
    USER_ROLE_FIELD,
    ERROR_HEADER,
    ERROR_FIELD,
    USER_ACTION_FIELD,
    USER_TOKEN_HEADER,
    API_KEY_HEADER
};
