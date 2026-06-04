"use strict";

const currentDate = new Date();
const indukUKSumberDanas = [
  {
    id: 1,
    indukUnitKerjaId: 1,
    sumberDanaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    indukUnitKerjaId: 1,
    sumberDanaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    indukUnitKerjaId: 2,
    sumberDanaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    indukUnitKerjaId: 2,
    sumberDanaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "indukUKSumberDanas",
      indukUKSumberDanas,
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("indukUKSumberDanas", null, {});
  },
};
