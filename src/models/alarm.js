module.exports = (sequelize, Sequelize) => {
    const Alarm = sequelize.define("alarm", {
        alarmSerial: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        location: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    Alarm.associate = function (models) {
        Alarm.belongsTo(models.user);
    };
    return Alarm;
};
