'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('templateBPDs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      namaKota: {
        type: Sequelize.STRING
      },
      uangHarian: {
        type: Sequelize.INTEGER
      },
      unitKerjaId: {
        type: Sequelize.INTEGER
      },    status: {
        type: Sequelize.ENUM( "aktif", "nonaktif"),
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
    await queryInterface.dropTable('templateBPDs');
  }
};