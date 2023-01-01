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

const width = 600;

async function saveFile(file) {
    const thumbnail = await sharp(file.content)
        .resize(width)
        .withMetadata()
        .toBuffer();

    await s3
        .putObject({
            Bucket: THUMBNAIL_BUCKET_NAME,
            Key: file.filename,
            Body: thumbnail,
        })
        .promise();

    await s3
        .putObject({
            Bucket: ORIGINAL_BUCKET_NAME,
            Key: file.filename,
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
            },
        })
        .promise();
    return {
        primary_key,
        savedFile: `https://${ORIGINAL_BUCKET_NAME}.s3.amazonaws.com/${file.filename}`,
        thumbnail: `https://${THUMBNAIL_BUCKET_NAME}.s3.amazonaws.com/${file.filename}`,
        labels,
    };
}

module.exports.savePhoto = async (event) => {
    try {
        const { files } = await parser.parse(event);
        const filesData = files.map(saveFile);
        const results = await Promise.all(filesData);

        return sendResponse(200, results);
    } catch (error) {
        console.error(error);
        return sendResponse(400, error);
    }
};
