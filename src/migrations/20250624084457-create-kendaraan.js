'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kendaraans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unitKerjaId: {
        type: Sequelize.INTEGER
      },
      pegawaiId: {
        type: Sequelize.INTEGER
      },
      noKontak: {
        type: Sequelize.BIGINT
      },
      nomor: {
        type: Sequelize.INTEGER
      },
      seri: {
        type: Sequelize.STRING
      },
      noRangka: {
        type: Sequelize.STRING
      },
      noMesin: {
        type: Sequelize.STRING
      },
      tgl_pkb: {
        type: Sequelize.STRING
      },
      tg_stnk: {
        type: Sequelize.STRING
      },
      total: {
        type: Sequelize.BIGINT
      },
      kondisiId: {
        type: Sequelize.INTEGER
      },
      jenisKendaraanId: {
        type: Sequelize.INTEGER
      },
      statusKendaraanId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kendaraans');
  }
};