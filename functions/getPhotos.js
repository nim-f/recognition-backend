const AWS = require("aws-sdk");
const formatPhotoResponse = require("../utils/formatPhotoResponse");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getPhotos = async (event) => {
    const results = await dynamoDb
        .scan({
            TableName: process.env.PHOTOS_TABLE,
            Limit: 50,
        })
        .promise();

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            results: formatPhotoResponse(results.Items),
        }),
    };
};
