const {
  user,
  profile,
  userRole,
  sequelize,
  role,
  pegawai,
  indukUnitKerja,
  daftarUnitKerja,
  daftarGolongan,
  daftarPangkat,
  daftarTingkatan,
  profesi,
  statusPegawai,
  rincianBPD,
  personil,
  usulanPegawai,
  pejabatVerifikator,
  indikatorPejabat,
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

      const existingUser = await user.findOne({ where: { namaPengguna } });
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

      const newUser = await user.create(
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
      const resultUser = await user.findOne({
        where: { namaPengguna },
        include: [
          { model: userRole, include: [{ model: role, attributes: ["nama"] }] },
          {
            model: profile,
            attributes: ["id", "nama", "profilePic", "pegawaiId"],
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja", "kode", "asal"],
                as: "unitKerja_profile",
                include: [
                  {
                    model: indukUnitKerja,
                    attributes: [
                      "id",
                      "kodeInduk",
                      "indukUnitKerja",
                      "penomoran","keuangan"
                    ],
                  },
                ],
              },
            ],
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

      const token = jwt.sign(
        { id: resultUser.id, role: resultUser.role },
        process.env.JWT_SECRET || "SECRET_KEY",
        { expiresIn: "12h" },
      );

      res.json({
        token,
        user: resultUser.profiles,
        role: resultUser.userRoles,
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
            model: daftarUnitKerja,
            attributes: ["id", "unitkerja", "kode"],
            as: "unitKerja_profile",
            include: [
              {
                model: indukUnitKerja,
                attributes: ["id", "indukUnitKerja", "kodeInduk"],
              },
            ],
          },
          {
            model: user,
            attributes: ["id", "namaPengguna"],
            include: [
              {
                model: userRole,
                attributes: ["id"],
                include: [{ model: role, attributes: ["nama"] }],
              },
            ],
          },
          {
            model: pegawai,
            attributes: [
              "id",
              "nama",
              "pendidikan",
              "nip",
              "jabatan",
              "tanggalTMT",
            ],
            include: [
              {
                model: daftarTingkatan,
                as: "daftarTingkatan",
              },
              { model: daftarGolongan, as: "daftarGolongan" },
              { model: daftarPangkat, as: "daftarPangkat" },
              {
                model: profesi,
                as: "profesi",
                attributes: ["nama", "id"],
              },
              {
                model: statusPegawai,
                as: "statusPegawai",
                attributes: ["status", "id"],
              },
              {
                model: daftarUnitKerja,
                as: "daftarUnitKerja",
                attributes: ["id", "unitKerja"],
              },
              {
                model: personil,
                attributes: ["id"],
                include: [{ model: rincianBPD }],
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
  adminDashboard: async (req, res) => {
    try {
      res.json({ message: "Ini adalah dashboard admin" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getRole: async (req, res) => {
    try {
      const result = await role.findAll({ attributes: ["id", "nama"] });
      const resultUnitKerja = await daftarUnitKerja.findAll({
        attributes: ["id", "unitKerja"],
      });
      return res.status(200).json({ result, resultUnitKerja });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getAllUser: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const namaPengguna = req.query.namaPengguna;
    const offset = limit * page;
    const search = req.query.search_query || "";
    const whereCondition = {
      nama: { [Op.like]: "%" + namaPengguna + "%" },
    };
    try {
      const result = await user.findAll({
        where: whereCondition,
        offset,
        limit,
        attributes: ["id", "nama", "namaPengguna"],
        include: [
          {
            model: userRole,
            include: [{ model: role, attributes: ["id", "nama"] }],
          },
          {
            model: profile,
            attributes: ["id", "nama"],
            include: [
              {
                model: daftarUnitKerja,
                as: "unitKerja_profile",
                attributes: ["id", "unitKerja"],
              },
            ],
          },
        ],
      });

      const totalRows = await user.count({
        where: whereCondition,
        offset,
        limit,
      });
      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  addRole: async (req, res) => {
    console.log(req.query, "CEK TAMBA USER ROLE");

    try {
      const { userId, roleId } = req.query;

      const result = await userRole.create({
        userId,
        roleId,
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

      const result = await userRole.destroy({
        where: { userId, id },
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
  deleteUser: async (req, res) => {
    console.log(req.params.id);
    try {
      const { id } = req.params;

      const result = await user.destroy({
        where: { id },
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
      const resultUser = await user.findOne({
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
      await user.update(
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
      const resultUser = await user.findOne({
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
      await user.update({ password: hashedPassword }, { where: { id } });

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
  uploadProfilePhoto: async (req, res) => {
    try {
      const userId = req.user?.id; // Dari JWT token yang sudah di-authenticate

      // Validasi user sudah login
      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized - User tidak terautentikasi",
        });
      }

      // Validasi file sudah diupload
      if (!req.file) {
        return res.status(400).json({
          message: "Silakan pilih foto terlebih dahulu",
        });
      }

      // Cari profile berdasarkan userId
      const userProfile = await profile.findOne({
        where: { userId },
      });

      if (!userProfile) {
        // Hapus file yang baru diupload jika profile tidak ditemukan
        const newFilePath = path.join(
          __dirname,
          "../public/profile",
          req.file.filename,
        );
        if (fs.existsSync(newFilePath)) {
          fs.unlinkSync(newFilePath);
        }
        return res.status(404).json({
          message: "Profile tidak ditemukan",
        });
      }

      // Ambil nama file lama dari body atau dari database
      const oldImgName = req.body.old_img || userProfile.profilePic;

      // Hapus file foto lama jika ada
      if (oldImgName) {
        // Normalisasi path - bisa berupa "/profile/filename.jpg" atau "filename.jpg"
        const normalizedOldImg = oldImgName.trim();
        const isPath =
          normalizedOldImg.startsWith("/") || normalizedOldImg.startsWith("\\");

        const oldFilePath = isPath
          ? path.join(
              __dirname,
              "../public",
              normalizedOldImg.replace(/[\\/]+/g, "/"),
            )
          : path.join(__dirname, "../public/profile", normalizedOldImg);

        // Hapus file lama jika ada
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error("Gagal menghapus file foto lama:", err);
              // Tidak throw error, karena file baru sudah terupload
            } else {
              console.log("File foto lama berhasil dihapus:", oldFilePath);
            }
          });
        }
      }

      // Simpan path file baru
      const newPhotoPath = `/profile/${req.file.filename}`;

      // Update profilePic di database
      await profile.update({ profilePic: newPhotoPath }, { where: { userId } });

      return res.status(200).json({
        message: "Foto profil berhasil diubah",
        photo: newPhotoPath,
      });
    } catch (err) {
      console.error("Error saat upload foto profile:", err);

      // Hapus file yang baru diupload jika terjadi error
      if (req.file) {
        const newFilePath = path.join(
          __dirname,
          "../public/profile",
          req.file.filename,
        );
        if (fs.existsSync(newFilePath)) {
          fs.unlink(newFilePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(
                "Gagal menghapus file yang baru diupload:",
                unlinkErr,
              );
            }
          });
        }
      }

      return res.status(500).json({
        message: "Gagal mengubah foto profil. Silakan coba lagi.",
        error: err.message,
      });
    }
  },
};
