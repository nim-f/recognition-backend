const AWS = require("aws-sdk");
const formatPhotoResponse = require("../utils/formatPhotoResponse");
const sendResponse = require("../utils/sendResponse");
const { PHOTOS_TABLE, USER_POOL, USER_POOL_CLIENT } = require("../const/paths");
const { dynamoDb } = require("../const/providers");
const fetchWithFilter = require("./utils/fetchWithFilter");
const Verifyer = require("aws-jwt-verify");

const verifyer = Verifyer.CognitoJwtVerifier.create({
    userPoolId: USER_POOL,
    clientId: USER_POOL_CLIENT,
    tokenUse: "access",
});

module.exports.getPhotos = async (event) => {
    const { limit, startKey, label } = event.queryStringParameters || {};
    const { authorization } = event.headers;
    const token = authorization.split(" ")[1];

    const { sub: userId } = await verifyer.verify(token);

    const ExclusiveStartKey = {
        primary_key: startKey,
    };

    const filter = label
        ? {
              ExpressionAttributeValues: {
                  ":label": label,
                  ":userId": userId,
              },
              FilterExpression:
                  "contains (labels, :label) and userId = :userId",
          }
        : {
              ExpressionAttributeValues: {
                  ":userId": userId,
              },
              FilterExpression: "userId = :userId",
          };
    const results = await fetchWithFilter({
        TableName: PHOTOS_TABLE,
        Limit: limit || 10,
        ...(startKey ? { ExclusiveStartKey } : {}),
        ...filter,
    });

    return sendResponse(200, {
        items: formatPhotoResponse(results.items),
        lastKey: results.lastKey,
    });
};
