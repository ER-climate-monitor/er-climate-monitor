const REGISTER_PATH = '/register';
const LOGIN_PATH = '/login';
const DELETE_PATH = '/delete/:userEmail';
const ADMIN = '/admin';
const REGISTER_ADMIN_PATH = ADMIN + REGISTER_PATH;
const LOGIN_ADMIN_PATH = ADMIN + LOGIN_PATH;
const DELETE_ADMIN_PATH = ADMIN + DELETE_PATH;

const AUTHORIZED_PATH = '/authorized';

export {
    REGISTER_PATH,
    REGISTER_ADMIN_PATH,
    LOGIN_PATH,
    LOGIN_ADMIN_PATH,
    DELETE_PATH,
    DELETE_ADMIN_PATH,
    AUTHORIZED_PATH,
};
