"use strict";

const constraintName = "fk-userroleKPBPN-roleKPBPN";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("userRoleKPBPNs", {
      fields: ["roleKPBPNId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "roleKPBPNs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("userRoleKPBPNs", constraintName);
  },
};
