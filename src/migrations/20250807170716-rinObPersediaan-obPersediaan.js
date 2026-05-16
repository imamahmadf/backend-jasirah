"use strict";

const constraintName = "fk-rinObPersediaan-obPersediaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("rinObPersediaans", {
      fields: ["obPersediaanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "obPersediaans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("rinObPersediaans", constraintName);
  },
};
