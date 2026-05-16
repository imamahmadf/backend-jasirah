"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("usulanPegawais", "formulirUsulan", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "skCpns", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "skPns", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "PAK", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "skJafung", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "skp", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "skMutasi", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "STR", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "suratCuti", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "gelar", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("usulanPegawais", "formulirUsulan");
    await queryInterface.removeColumn("usulanPegawais", "skCpns");
    await queryInterface.removeColumn("usulanPegawais", "skPns");
    await queryInterface.removeColumn("usulanPegawais", "PAK");
    await queryInterface.removeColumn("usulanPegawais", "skJafung");
    await queryInterface.removeColumn("usulanPegawais", "skp");
    await queryInterface.removeColumn("usulanPegawais", "skMutasi");
    await queryInterface.removeColumn("usulanPegawais", "STR");
    await queryInterface.removeColumn("usulanPegawais", "suratCuti");
    await queryInterface.removeColumn("usulanPegawais", "gelar");
  },
};
