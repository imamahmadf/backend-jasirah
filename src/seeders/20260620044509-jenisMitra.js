"use strict";

const currentDate = new Date();
const jenisMitras = [
  {
    id: 1,

    createdAt: currentDate,
    updatedAt: currentDate,
    jenis: "Koperasi",
    kode: "KPR",
  },
  {
    id: 2,

    createdAt: currentDate,
    updatedAt: currentDate,
    jenis: "Paguyuban",
    kode: "PGY",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisMitras", jenisMitras, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisMitras", null, {});
  },
};
