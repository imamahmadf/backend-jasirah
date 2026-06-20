const {
  user,
  profile,
  userRole,
  sequelize,
  role,
  pegawai,
  userRoleKPBPN,
  userKPBPN,
  roleKPBPN,
  daftarUnitKerja,
  profesi,
  statusPegawai,
  rincianBPD,
  personil,
  usulanPegawai,
  pejabatVerifikator,
  indikatorPejabat,
  indukUnitKerja,
} = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { blacklistedTokens } = require("../lib/auth");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
module.exports = {
  register: async (req, res) => {
    const transaction = await sequelize.transaction();
    console.log(req.body);
    try {
      const { nama, namaPengguna, password, role, unitKerjaId, pegawaiId } =
        req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await userKPBPN.findOne({ where: { namaPengguna } });
      if (existingUser) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Nama pengguna sudah digunakan" });
      }

      // Validasi pegawaiId tidak boleh duplikat
      if (pegawaiId) {
        const existingProfile = await profile.findOne({ where: { pegawaiId } });
        if (existingProfile) {
          await transaction.rollback();
          return res
            .status(400)
            .json({ message: "Pegawai ID sudah digunakan" });
        }
      }

      const newUser = await KPBPN.create(
        {
          nama,
          namaPengguna,
          password: hashedPassword,
        },
        { transaction },
      );

      const newProfile = await profile.create(
        {
          nama,
          userId: newUser.id,
          unitKerjaId,
          pegawaiId,
        },
        { transaction },
      );

      const newUserRole = await userRole.create(
        {
          userId: newUser.id,
          roleId: role,
        },
        { transaction },
      );

      await transaction.commit();
      res.status(201).json({ message: "Registrasi berhasil" });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      // Handle unique constraint error
      if (
        err.name === "SequelizeUniqueConstraintError" ||
        err.name === "SequelizeValidationError"
      ) {
        if (err.errors && err.errors.some((e) => e.path === "namaPengguna")) {
          return res
            .status(400)
            .json({ message: "Nama pengguna sudah digunakan" });
        }
        if (err.errors && err.errors.some((e) => e.path === "pegawaiId")) {
          return res
            .status(400)
            .json({ message: "Pegawai ID sudah digunakan" });
        }
      }
      res.status(500).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { namaPengguna, password } = req.body;
      const resultUser = await userKPBPN.findOne({
        where: { namaPengguna },
        include: [
          {
            model: userRoleKPBPN,
            include: [{ model: roleKPBPN, attributes: ["name"] }],
          },
        ],
      });

      if (!resultUser) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        resultUser.password,
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const userRoles = resultUser.userRoleKPBPNs ?? [];
      const roleIds = userRoles.map((item) => item.roleKPBPNId);

      const token = jwt.sign(
        { id: resultUser.id, roleIds },
        process.env.JWT_SECRET || "SECRET_KEY",
        { expiresIn: "12h" },
      );

      res.json({
        token,
        user: {
          id: resultUser.id,
          nama: resultUser.nama,
          namaPengguna: resultUser.namaPengguna,
        },
        role: userRoles,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  logout: async (req, res) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res.status(400).json({ message: "No token provided" });
      }

      // Tambahkan token ke blacklist
      blacklistedTokens.add(token);

      res.json({ message: "Logout berhasil" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Contoh endpoint yang dilindungi
  getProfile: async (req, res) => {
    const id = req.params.id;

    try {
      const result = await profile.findOne({
        attributes: ["id", "nama", "profilePic"],
        where: { id },
        include: [
          {
            model: userKPBPN,
            attributes: ["id", "namaPengguna"],
            include: [
              {
                model: userRoleKPBPN,
                attributes: ["id"],
                include: [{ model: roleKPBPN, attributes: ["name"] }],
              },
            ],
          },
        ],
      });
      return res
        .status(200)
        .json({ result, message: "Data profile berhasil diambil" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // Contoh endpoint khusus admin

  getRole: async (req, res) => {
    try {
      const result = await roleKPBPN.findAll({ attributes: ["id", "name"] });
      const resultUnitKerja = await daftarUnitKerja.findAll({
        attributes: ["id", "unitKerja"],
      });
      return res.status(200).json({ result, resultUnitKerja });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addRole: async (req, res) => {
    console.log(req.query, "CEK TAMBA USER ROLE");

    try {
      const { userKPBPNId, roleKPBPNId } = req.query;

      const result = await userRoleKPBPN.create({
        userKPBPNId,
        roleKPBPNId,
      });

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  deleteRole: async (req, res) => {
    // console.log(req.query);
    try {
      const { userId, id } = req.query;

      const result = await userRoleKPBPN.destroy({
        where: { userKPBPNId: userId, id },
      });

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { passwordLama, passwordBaru } = req.body;
      const userId = req.user.id; // Dari JWT token yang sudah di-authenticate

      // Validasi input
      if (!passwordLama || !passwordBaru) {
        return res.status(400).json({
          message: "Password lama dan password baru harus diisi",
        });
      }

      // Validasi panjang password baru
      if (passwordBaru.length < 6) {
        return res.status(400).json({
          message: "Password baru minimal 6 karakter",
        });
      }

      // Cari user berdasarkan ID
      const resultUser = await userKPBPN.findOne({
        where: { id: userId },
      });

      if (!resultUser) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      // Verifikasi password lama
      const isPasswordValid = await bcrypt.compare(
        passwordLama,
        resultUser.password,
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Password lama tidak sesuai",
        });
      }

      // Hash password baru
      const hashedPassword = await bcrypt.hash(passwordBaru, 10);

      // Update password di database
      await userKPBPN.update(
        { password: hashedPassword },
        { where: { id: userId } },
      );

      return res.status(200).json({
        message: "Password berhasil diubah",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  updatePassword: async (req, res) => {
    try {
      const { passwordBaru } = req.body;
      const { id } = req.params;

      // Validasi input
      if (!passwordBaru) {
        return res.status(400).json({
          message: "Password baru harus diisi",
        });
      }

      // Validasi panjang password baru
      if (passwordBaru.length < 6) {
        return res.status(400).json({
          message: "Password baru minimal 6 karakter",
        });
      }

      // Cari user berdasarkan ID
      const resultUser = await userKPBPN.findOne({
        where: { id },
      });

      if (!resultUser) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      // Hash password baru
      const hashedPassword = await bcrypt.hash(passwordBaru, 10);

      // Update password di database
      await userKPBPN.update({ password: hashedPassword }, { where: { id } });

      return res.status(200).json({
        message: "Password berhasil diubah",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
