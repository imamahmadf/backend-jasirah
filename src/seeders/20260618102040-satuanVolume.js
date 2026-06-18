"use strict";

const currentDate = new Date();
const satuanVolumes = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    satuan: "Barrel",

    id: 1,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    satuan: "Liter",

    id: 2,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    satuan: "Drum",

    id: 3,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("satuanVolumes", satuanVolumes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("satuanVolumes", null, {});
  },
};
