const parser = require("lambda-multipart-parser");
const { v4: uuidv4 } = require("uuid");
// const sharp = require("sharp");
const sendResponse = require("../utils/sendResponse");
const {
    PHOTOS_TABLE,
    ORIGINAL_BUCKET_NAME,
    THUMBNAIL_BUCKET_NAME,
} = require("../const/paths");

const { s3, rekognition, dynamoDb } = require("../const/providers");

const width = 600;

async function saveFile(file, userId) {
    const thumbnail = file.content; //await sharp(file.content)
    // .resize(width)
    // .withMetadata()
    // .toBuffer();
    const Key = `${userId}/${file.filename}`;
    await s3
        .putObject({
            Bucket: THUMBNAIL_BUCKET_NAME,
            Key,
            Body: thumbnail,
        })
        .promise();

    await s3
        .putObject({
            Bucket: ORIGINAL_BUCKET_NAME,
            Key,
            Body: file.content,
        })
        .promise();

    const { Labels } = await rekognition
        .detectLabels({
            Image: {
                Bytes: thumbnail,
            },
        })
        .promise();

    const primary_key = uuidv4();
    const labels = Labels.map((label) => label.Name);
    await dynamoDb
        .put({
            TableName: PHOTOS_TABLE,
            Item: {
                primary_key,
                name: file.filename,
                labels,
                userId,
            },
        })
        .promise();
    return {
        primary_key,
        savedFile: `https://${ORIGINAL_BUCKET_NAME}.s3.amazonaws.com/${Key}`,
        thumbnail: `https://${THUMBNAIL_BUCKET_NAME}.s3.amazonaws.com/${Key}`,
        labels,
    };
}

module.exports.savePhoto = async (event) => {
    try {
        const { files, userId } = await parser.parse(event);
        const filesData = files.map((file) => saveFile(file, userId));
        const results = await Promise.all(filesData);

        return sendResponse(200, results);
    } catch (error) {
        console.error(error);
        return sendResponse(400, error);
    }
};
