"use strict";

const constraintName = "fk-userrole-user";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("userRoles", {
      fields: ["userId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("userRoles", constraintName);
  },
};
