const parser = require("lambda-multipart-parser");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const sendResponse = require("../utils/sendResponse");
const {
    PHOTOS_TABLE,
    ORIGINAL_BUCKET_NAME,
    THUMBNAIL_BUCKET_NAME,
} = require("../const/paths");

const { s3, rekognition, dynamoDb } = require("../const/providers");

module.exports.deletePhoto = async (event) => {
    try {
        const { primary_key, name } = JSON.parse(event.body);

        const originalParams = {
            Bucket: ORIGINAL_BUCKET_NAME,
            Key: name,
        };
        const thumbnailParams = {
            Bucket: THUMBNAIL_BUCKET_NAME,
            Key: name,
        };

        await s3.deleteObject(originalParams).promise();
        await s3.deleteObject(thumbnailParams).promise();

        const deleteFromDBParams = {
            TableName: PHOTOS_TABLE,
            Key: {
                primary_key,
            },
        };
        await dynamoDb.delete(deleteFromDBParams).promise();
        return sendResponse(200, { primary_key });
    } catch (error) {
        console.error(error);
        return sendResponse(400, error);
    }
};
