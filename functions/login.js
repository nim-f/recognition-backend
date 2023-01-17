const sendResponse = require("../utils/sendResponse");
const { USER_POOL, USER_POOL_CLIENT } = require("../const/paths");

const { cognito } = require("../const/providers");
module.exports.login = async (event) => {
    try {
        console.log({ env: JSON.stringify(process.env) });
        const { email, password } = JSON.parse(event.body);

        const response = await cognito
            .adminInitiateAuth({
                AuthFlow: "ADMIN_NO_SRP_AUTH",
                UserPoolId: USER_POOL,
                ClientId: USER_POOL_CLIENT,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password,
                },
            })
            .promise();

        console.log({ response });
        return sendResponse(200, response.AuthenticationResult);
    } catch (error) {
        console.error(error);
        return sendResponse(400, error);
    }
};
