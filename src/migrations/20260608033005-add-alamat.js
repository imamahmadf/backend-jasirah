"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pegawais", "alamat", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("pegawais", "tempatLahir", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("pegawais", "tanggalLahir", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("pegawais", "alamat");
    await queryInterface.removeColumn("pegawais", "tempatLahir");
    await queryInterface.removeColumn("pegawais", "tanggalLahir");
  },
};
