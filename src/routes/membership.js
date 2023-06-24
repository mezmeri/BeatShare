function setupMembershipRoutes(app) {
    app.post('/login', (req, res) => {
        res.send(`You're logged in!`);
    });
};

module.exports = {
    setupMembershipRoutes
};