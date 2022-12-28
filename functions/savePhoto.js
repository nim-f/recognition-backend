const AWS = require("aws-sdk");
const parser = require("lambda-multipart-parser");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const width = 600;

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function saveFile(file) {
    const BucketName = process.env.ORIGINAL_BUCKET_NAME;
    const ThumbnailBucketName = process.env.THUMBNAIL_BUCKET_NAME;

    const thumbnail = await sharp(file.content)
        .resize(width)
        .withMetadata()
        .toBuffer();

    await s3
        .putObject({
            Bucket: ThumbnailBucketName,
            Key: file.filename,
            Body: thumbnail,
        })
        .promise();

    await s3
        .putObject({
            Bucket: BucketName,
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
            TableName: process.env.PHOTOS_TABLE,
            Item: {
                primary_key,
                name: file.filename,
                labels,
            },
        })
        .promise();
    return {
        primary_key,
        savedFile: `https://${BucketName}.s3.amazonaws.com/${file.filename}`,
        thumbnail: `https://${ThumbnailBucketName}.s3.amazonaws.com/${file.filename}`,
        labels,
    };
}

module.exports.savePhoto = async (event) => {
    try {
        const { files } = await parser.parse(event);
        const filesData = files.map(saveFile);
        const results = await Promise.all(filesData);

        return {
            statusCode: 200,
            body: JSON.stringify({
                results,
            }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error,
            }),
        };
    }
};
