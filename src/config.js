module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    WEDO_API_KEY: process.env.WEDO_API_KEY,
    CLIENT_ORIGIN: process.env.NODE_ENV === 'development'
        ? "http://localhost:3000"
        : process.env.CLIENT_ORIGIN
};
