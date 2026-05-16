"use strict";

const constraintName = "fk-tipePersediaan-persediaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("persediaans", {
      fields: ["tipePersediaanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "tipePersediaans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("persediaans", constraintName);
  },
};
