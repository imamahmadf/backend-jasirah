"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class personil extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.perjalanan);
      this.belongsTo(models.pegawai);
      this.hasMany(models.rincianBPD);
      this.belongsTo(models.status);
    }
  }
  personil.init(
    {
      pegawaiId: DataTypes.INTEGER,
      perjalananId: DataTypes.INTEGER,
      statusId: DataTypes.INTEGER,
      total: DataTypes.INTEGER,
      nomorSPD: DataTypes.STRING,
      catatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "personil",
      hooks: {
        // Hook setelah update untuk emit notifikasi jika statusId berubah
        afterUpdate: async (personilInstance, options) => {
          // Cek apakah statusId berubah menjadi 2 atau 4, atau dari 2 atau 4
          const previousStatusId =
            personilInstance._previousDataValues?.statusId;
          const currentStatusId = personilInstance.statusId;

          // Skip jika statusId tidak berubah
          if (previousStatusId === currentStatusId) {
            return;
          }

          const wasStatusId2Or4 =
            previousStatusId === 2 || previousStatusId === 4;
          const isStatusId2Or4 = currentStatusId === 2 || currentStatusId === 4;

          // Emit notifikasi jika:
          // 1. StatusId berubah menjadi 2 atau 4 (dari nilai lain)
          // 2. StatusId berubah dari 2 atau 4 (ke nilai lain)
          // 3. StatusId berubah antara 2 dan 4
          if (wasStatusId2Or4 || isStatusId2Or4) {
            // Ada perubahan yang mempengaruhi count statusId=2 atau statusId=4
            try {
              // Coba akses io dari global atau dari helper
              if (global.socketIO) {
                const {
                  emitNotifikasiPersonil,
                } = require("../controllers/notifikasiControllers");
                await emitNotifikasiPersonil(global.socketIO);
              }
            } catch (err) {
              // Jangan gagalkan update jika notifikasi gagal
              console.error("⚠️ Error emit notifikasi dari hook:", err.message);
            }
          }
        },
      },
    }
  );
  return personil;
};
