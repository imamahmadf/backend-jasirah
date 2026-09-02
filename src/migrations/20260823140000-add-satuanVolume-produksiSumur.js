"use strict";

const constraintName = "fk-satuanVolume-produksiSumur";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("produksiSumurs", "satuanVolumeId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE produksiSumurs ps
      INNER JOIN suratJalans sj ON ps.suratJalanId = sj.id
      SET ps.satuanVolumeId = sj.satuanVolumeId
      WHERE ps.suratJalanId IS NOT NULL AND sj.satuanVolumeId IS NOT NULL
    `);

    await queryInterface.addConstraint("produksiSumurs", {
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
    await queryInterface.removeConstraint("produksiSumurs", constraintName);
    await queryInterface.removeColumn("produksiSumurs", "satuanVolumeId");
  },
};
