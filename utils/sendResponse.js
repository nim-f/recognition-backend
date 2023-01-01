module.exports = (statusCode, body, headers = {}) => ({
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        ...headers,
    },
    statusCode,
    body: JSON.stringify(body),
});
