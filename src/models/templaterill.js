'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class templateRill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.templateBPD, {
        foreignKey: "templateBPDId",
      });
    }
  }
  templateRill.init({
    templateBPDId: DataTypes.INTEGER,
    uraian: DataTypes.STRING,
    nilai: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'templateRill',
  });
  return templateRill;
};