const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = {
    s3,
    rekognition,
    dynamoDb,
};
