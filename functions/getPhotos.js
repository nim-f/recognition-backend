const AWS = require("aws-sdk");
const formatPhotoResponse = require("../utils/formatPhotoResponse");
const sendResponse = require("../utils/sendResponse");
const { PHOTOS_TABLE } = require("../const/paths");
const { dynamoDb } = require("../const/providers");

module.exports.getPhotos = async (event) => {
    const { limit, startKey } = event.queryStringParameters;

    const ExclusiveStartKey = {
        primary_key: startKey,
    };
    const results = await dynamoDb
        .scan({
            TableName: PHOTOS_TABLE,
            Limit: limit || 10,
            ...(startKey ? { ExclusiveStartKey } : {}),
        })
        .promise();
        
    return sendResponse(200, {
        items: formatPhotoResponse(results.Items),
        lastKey: results?.LastEvaluatedKey?.primary_key,
    });
};
