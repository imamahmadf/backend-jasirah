'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mutasiPersediaans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      stokMasukAsalId: {
        type: Sequelize.INTEGER
      },
      stokMasukTujuanId: {
        type: Sequelize.INTEGER
      },
      unitKerjaAsalId: {
        type: Sequelize.INTEGER
      },
      unitKerjaTujuanId: {
        type: Sequelize.INTEGER
      },
      jumlah: {
        type: Sequelize.INTEGER
      },
      tanggal: {
        type: Sequelize.DATE
      },
      keterangan: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('mutasiPersediaans');
  }
};