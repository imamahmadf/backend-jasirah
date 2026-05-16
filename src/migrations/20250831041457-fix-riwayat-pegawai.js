"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cek apakah kolom unitKerjaBaruId masih ada
    const tableDescription = await queryInterface.describeTable(
      "riwayatPegawais"
    );

    // Jika unitKerjaBaruId masih ada, rename ke golonganId
    if (tableDescription.unitKerjaBaruId) {
      await queryInterface.renameColumn(
        "riwayatPegawais",
        "unitKerjaBaruId",
        "golonganId"
      );
    } else if (!tableDescription.golonganId) {
      // Jika unitKerjaBaruId tidak ada dan golonganId belum ada, tambahkan golonganId
      await queryInterface.addColumn("riwayatPegawais", "golonganId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    // Jika profesiBaruId masih ada, rename ke pangkatId
    if (tableDescription.profesiBaruId) {
      await queryInterface.renameColumn(
        "riwayatPegawais",
        "profesiBaruId",
        "pangkatId"
      );
    } else if (!tableDescription.pangkatId) {
      // Jika profesiBaruId tidak ada dan pangkatId belum ada, tambahkan pangkatId
      await queryInterface.addColumn("riwayatPegawais", "pangkatId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable(
      "riwayatPegawais"
    );

    // Jika golonganId ada, rename kembali ke unitKerjaBaruId
    if (tableDescription.golonganId) {
      await queryInterface.renameColumn(
        "riwayatPegawais",
        "golonganId",
        "unitKerjaBaruId"
      );
    }

    // Jika pangkatId ada, rename kembali ke profesiBaruId
    if (tableDescription.pangkatId) {
      await queryInterface.renameColumn(
        "riwayatPegawais",
        "pangkatId",
        "profesiBaruId"
      );
    }
  },
};
