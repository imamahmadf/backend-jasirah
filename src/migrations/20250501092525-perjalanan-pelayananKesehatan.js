"use strict";

const constraintName = "fk-pelayananKesehatan-perjalanan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["pelayananKesehatanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "pelayananKesehatans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("perjalanans", constraintName);
  },
};
