module.exports = (attributes) => {
    return attributes.reduce((acc, { Name, Value }) => {
        return { ...acc, [Name]: Value };
    }, {});
};
