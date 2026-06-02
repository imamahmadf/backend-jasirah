"use strict";

const currentDate = new Date();
const kendaraans = [
  {
    id: 1,
    tgl_pkb: "1900-01-00",
    tg_stnk: "1900-01-00",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("kendaraans", kendaraans, {
      updateOnDuplicate: ["tgl_pkb", "tg_stnk"],
    });
  },

  async down(queryInterface, Sequelize) {},
};
