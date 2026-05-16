"use strict";

const constraintName = "fk-kendaraan-kondisi";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kendaraans", {
      fields: ["kondisiId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kondisis",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("kendaraans", constraintName);
  },
};
