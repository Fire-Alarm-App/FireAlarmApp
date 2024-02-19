module.exports = (sequelize, Sequelize) => {
    const Subscription = sequelize.define("subscription", {
        endpoint: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        expirationTime: {
            type: Sequelize.TIME,
        },
        p256dh: {
            type: Sequelize.STRING,
            allowNull: false
        },
        auth: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    Subscription.associate = function (models) {
        Subscription.belongsTo(models.user);
    };
    return Subscription;
};