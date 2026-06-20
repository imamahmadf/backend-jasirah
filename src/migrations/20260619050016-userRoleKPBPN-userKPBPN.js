"use strict";

const constraintName = "fk-userroleKPBPN-userKPBPN";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("userRoleKPBPNs", {
      fields: ["userKPBPNId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "userKPBPNs",
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
