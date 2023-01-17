const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();

module.exports = {
    s3,
    rekognition,
    dynamoDb,
    cognito,
};
