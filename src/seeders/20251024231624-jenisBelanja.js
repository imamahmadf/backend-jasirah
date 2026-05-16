"use strict";

const currentDate = new Date();
const jenisBelanjas = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    jenis: "barang",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    jenis: "jasa",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisBelanjas", jenisBelanjas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisBelanjas", null, {});
  },
};
