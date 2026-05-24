"use strict";

const constraintName = "fk-payroll-payrollPotongan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("payrollPotongans", {
      fields: ["payrollId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "payrolls",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("payrollPotongans", constraintName);
  },
};
