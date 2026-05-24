"use strict";

const constraintName = "fk-payroll-payrollTunjangan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("payrollTunjangans", {
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
    await queryInterface.removeConstraint("payrollTunjangans", constraintName);
  },
};
