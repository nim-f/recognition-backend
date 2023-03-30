const sendResponse = require("../utils/sendResponse");
const { USER_POOL, USER_POOL_CLIENT } = require("../const/paths");

const { cognito } = require("../const/providers");
module.exports.getUser = async (event) => {
    try {
        const { AccessToken } = JSON.parse(event.body);
        const data = await cognito
            .getUser({
                AccessToken,
            })
            .promise();
        return sendResponse(200, formatUserAttributes(data.UserAttributes));
    } catch (error) {
        console.error(error);
        return sendResponse(400, error);
    }
};
