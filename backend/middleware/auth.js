module.exports = (req, res, next) => {
    // Mock auth middleware
    req.user = { id: 'mock_user_id' };
    next();
};