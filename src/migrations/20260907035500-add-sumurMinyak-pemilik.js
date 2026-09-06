"use strict";

const columns = [
  "namaPemilikLahan",
  "namaPemilikSumur",
  "kontakPemilikLahan",
  "kontakPemilikSumur",
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const column of columns) {
      await queryInterface.addColumn("sumurMinyaks", column, {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    for (const column of [...columns].reverse()) {
      await queryInterface.removeColumn("sumurMinyaks", column);
    }
  },
};
