"use strict";

const constraintName = "fk-satuanVolume-tanki";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tankis", "satuanVolumeId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("tankis", {
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
    await queryInterface.removeConstraint("tankis", constraintName);
    await queryInterface.removeColumn("tankis", "satuanVolumeId");
  },
};
