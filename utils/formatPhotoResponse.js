const { THUMBNAIL_BUCKET_NAME } = require("../const/paths");

module.exports = (list) => {
    return list.map((item) => ({
        ...item,
        url: `https://${THUMBNAIL_BUCKET_NAME}.s3.amazonaws.com/${item.userId}/${item.name}`,
    }));
};
