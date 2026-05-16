"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("realisasiKinerjaPJPLs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kinerjaPJPLId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "kinerjaPJPLs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      realisasiPJPLId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "realisasiPJPLs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Menambahkan unique constraint untuk mencegah duplikasi
    await queryInterface.addConstraint("realisasiKinerjaPJPLs", {
      fields: ["kinerjaPJPLId", "realisasiPJPLId"],
      type: "unique",
      name: "unique_kinerja_realisasi",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("realisasiKinerjaPJPLs");
  },
};
