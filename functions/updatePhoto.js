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

const createUpdateExpression = (data) => {
    const UpdateExpression = `set ${Object.keys(data)
        .map((key) => `#${key} = :${key}`)
        .join(",")}`;
    const ExpressionAttributeNames = Object.keys(data).reduce((acc, key) => {
        return { ...acc, [`#${key}`]: key };
    }, {});
    const ExpressionAttributeValues = Object.entries(data).reduce(
        (acc, [key, value]) => {
            return { ...acc, [`:${key}`]: value };
        },
        {}
    );
    return {
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };
};

const renameFileInBucket = async (oldName, newName, bucketName) => {
    const params = {
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldName}`,
        Key: newName,
    };
    await s3.copyObject(params).promise();
    await s3
        .deleteObject({
            Bucket: bucketName,
            Key: oldName,
        })
        .promise();
};

module.exports.updatePhoto = async (event) => {
    try {
        const { primary_key, name, newName, ...data } = JSON.parse(event.body);

        if (newName) {
            // s3 rename
            await renameFileInBucket(name, newName, ORIGINAL_BUCKET_NAME);
            await renameFileInBucket(name, newName, THUMBNAIL_BUCKET_NAME);
            data["name"] = newName;
        }

        const updateExpression = createUpdateExpression(data);

        var params = {
            TableName: PHOTOS_TABLE,
            Key: { primary_key },
            ...updateExpression,
        };
        await dynamoDb.update(params).promise();
        return sendResponse(200, { item: {} });
    } catch (error) {
        console.error(error);
        return sendResponse(400, error);
    }
};
