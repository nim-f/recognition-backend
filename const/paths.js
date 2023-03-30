module.exports = {
    PHOTOS_TABLE: process.env.PHOTOS_TABLE,
    ORIGINAL_BUCKET_NAME: process.env.ORIGINAL_BUCKET_NAME,
    THUMBNAIL_BUCKET_NAME: process.env.THUMBNAIL_BUCKET_NAME,
    USER_POOL: process.env.IS_OFFLINE
        ? "us-east-1_tDDYvHm0Z"
        : process.env.USER_POOL,
    USER_POOL_CLIENT: process.env.IS_OFFLINE
        ? "22oocthbi9shrrokhup3f1bf2o"
        : process.env.USER_POOL_CLIENT,
};
