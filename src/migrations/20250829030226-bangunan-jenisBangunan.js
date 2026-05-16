"use strict";

const constraintName = "fk-bangunan-jenisBangunan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("bangunans", {
      fields: ["jenisBangunanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisBangunans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("bangunans", constraintName);
  },
};
