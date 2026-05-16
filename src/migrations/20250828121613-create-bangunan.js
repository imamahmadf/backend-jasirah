"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bangunans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      indukUnitKerjaId: {
        type: Sequelize.INTEGER,
      },
      nama: {
        type: Sequelize.STRING,
      },
      alamat: {
        type: Sequelize.STRING,
      },
      jenisBangunanId: {
        type: Sequelize.INTEGER,
      },
      luasTanah: {
        type: Sequelize.INTEGER,
      },
      luasBangunan: {
        type: Sequelize.INTEGER,
      },
      tahunPembangunan: {
        type: Sequelize.INTEGER,
      },
      kondisiBangunanId: {
        type: Sequelize.INTEGER,
      },
      EBMD: {
        type: Sequelize.ENUM("ya", "tidak"),
      },
      sertifikatTanah: {
        type: Sequelize.ENUM("ya", "tidak"),
      },
      kepemilikanTanah: { type: Sequelize.STRING },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bangunans");
  },
};
