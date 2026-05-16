"use strict";

const constraintName = "fk-akunBelanja-jenisBelanja";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("akunBelanjas", {
      fields: ["jenisBelanjaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisBelanjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("akunBelanjas", constraintName);
  },
};
