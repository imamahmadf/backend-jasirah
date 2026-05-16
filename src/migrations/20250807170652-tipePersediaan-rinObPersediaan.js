"use strict";

const constraintName = "fk-tipePersediaan-rinObPersediaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("tipePersediaans", {
      fields: ["rinObPersediaanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "rinObPersediaans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("tipePersediaans", constraintName);
  },
};
