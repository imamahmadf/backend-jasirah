"use strict";

const constraintName = "fk-satuanVolume-konfirmasiPenerimaan";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("konfirmasiPenerimaans", "volumeAir", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });

    await queryInterface.addColumn("konfirmasiPenerimaans", "volumeAkhir", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });

    await queryInterface.addColumn("konfirmasiPenerimaans", "SG", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });

    await queryInterface.addColumn("konfirmasiPenerimaans", "satuanVolumeId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("konfirmasiPenerimaans", {
      fields: ["satuanVolumeId"],
      type: "foreign key",
      name: constraintName,
      references: {
        table: "satuanVolumes",
        field: "id",
      },
      onDelete: "set null",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "konfirmasiPenerimaans",
      constraintName,
    );
    await queryInterface.removeColumn("konfirmasiPenerimaans", "satuanVolumeId");
    await queryInterface.removeColumn("konfirmasiPenerimaans", "SG");
    await queryInterface.removeColumn("konfirmasiPenerimaans", "volumeAkhir");
    await queryInterface.removeColumn("konfirmasiPenerimaans", "volumeAir");
  },
};
