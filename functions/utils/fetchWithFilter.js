const { dynamoDb } = require("../../const/providers");

const fetchWithFilter = async (params, prev = []) => {
    const results = await dynamoDb.query(params).promise();
    const items = [...prev, ...results.Items];
    const truncatedItems = items.slice(0, params.Limit);
    if (items.length < params.Limit && results?.LastEvaluatedKey) {
        return await fetchWithFilter(
            {
                ...params,
                ExclusiveStartKey: results.LastEvaluatedKey,
            },
            truncatedItems
        );
    }

    return {
        items: truncatedItems,
        lastKey:
            results?.LastEvaluatedKey || truncatedItems < items
                ? truncatedItems[truncatedItems.length - 1].primary_key
                : undefined,
    };
};

module.exports = fetchWithFilter;
