const AWS = require("aws-sdk");
const formatPhotoResponse = require("../utils/formatPhotoResponse");
const sendResponse = require("../utils/sendResponse");
const { PHOTOS_TABLE } = require("../const/paths");
const { dynamoDb } = require("../const/providers");

module.exports.getPhotos = async (event) => {
    const results = await dynamoDb
        .scan({
            TableName: PHOTOS_TABLE,
            Limit: 50,
        })
        .promise();

    return sendResponse(200, formatPhotoResponse(results.Items));
};
