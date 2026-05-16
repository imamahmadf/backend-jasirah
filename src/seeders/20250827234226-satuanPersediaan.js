"use strict";

const currentDate = new Date();
const satuanPersediaans = [
  { id: 1, satuan: "Baik", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    satuan: "Box",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    satuan: "Buah",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    satuan: "Unit",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    satuan: "Rim",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("satuanPersediaans", satuanPersediaans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("satuanPersediaans", null, {});
  },
};
