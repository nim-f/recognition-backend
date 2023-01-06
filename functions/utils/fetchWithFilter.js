const { dynamoDb } = require("../../const/providers");

const fetchWithFilter = async (params, prev = []) => {
    const results = await dynamoDb.scan(params).promise();

    const items = [...prev, ...results.Items].slice(0, params.Limit);
    if (items.length < params.Limit && results?.LastEvaluatedKey) {
        return await fetchWithFilter(
            {
                ...params,
                ExclusiveStartKey: results.LastEvaluatedKey,
            },
            items
        );
    }

    return {
        items,
        lastKey:
            results?.LastEvaluatedKey && items[items.length - 1].primary_key,
    };
};

module.exports = fetchWithFilter;
