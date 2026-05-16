// Mock models HARUS dipanggil sebelum require controller
jest.mock("../../models", () => ({
  capaian: {
    create: jest.fn(),
    update: jest.fn(),
  },
  target: {
    findAll: jest.fn(),
  },
  indikator: {},
  subKegPer: {},
  targetTriwulan: {},
  namaTarget: {},
  tahunAnggaran: {},
  jenisAnggaran: {},
}));

const capaianControllers = require("../capaianControllers");
const {
  capaian,
  target,
  indikator,
  subKegPer,
  targetTriwulan,
  namaTarget,
  tahunAnggaran,
  jenisAnggaran,
} = require("../../models");

describe("Capaian Controllers", () => {
  let req, res;

  beforeEach(() => {
    // Setup mock request dan response
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    // Clear all mocks sebelum setiap test
    jest.clearAllMocks();
  });

  describe("postCapaian", () => {
    it("harus berhasil membuat capaian baru", async () => {
      // Arrange
      const mockCapaianData = {
        id: 1,
        targetId: 1,
        nilai: 100,
        bulan: 1,
        anggaran: 5000000,
        bukti: "bukti.jpg",
        status: "pengajuan",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      req.body = {
        targetId: 1,
        nilai: 100,
        bulan: 1,
        anggaran: 5000000,
        bukti: "bukti.jpg",
      };

      capaian.create.mockResolvedValue(mockCapaianData);

      // Act
      await capaianControllers.postCapaian(req, res);

      // Assert
      expect(capaian.create).toHaveBeenCalledWith({
        targetId: 1,
        nilai: 100,
        bulan: 1,
        anggaran: 5000000,
        bukti: "bukti.jpg",
        status: "pengajuan",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: mockCapaianData });
    });

    it("harus mengembalikan error 500 jika terjadi kesalahan", async () => {
      // Arrange
      const mockError = new Error("Database error");
      req.body = {
        targetId: 1,
        nilai: 100,
        bulan: 1,
        anggaran: 5000000,
        bukti: "bukti.jpg",
      };

      capaian.create.mockRejectedValue(mockError);

      // Act
      await capaianControllers.postCapaian(req, res);

      // Assert
      expect(capaian.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });

    it("harus membuat capaian dengan status pengajuan secara default", async () => {
      // Arrange
      const mockCapaianData = {
        id: 1,
        targetId: 1,
        nilai: 50,
        bulan: 2,
        anggaran: 3000000,
        bukti: "bukti2.jpg",
        status: "pengajuan",
      };

      req.body = {
        targetId: 1,
        nilai: 50,
        bulan: 2,
        anggaran: 3000000,
        bukti: "bukti2.jpg",
      };

      capaian.create.mockResolvedValue(mockCapaianData);

      // Act
      await capaianControllers.postCapaian(req, res);

      // Assert
      expect(capaian.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pengajuan",
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getAllCapaian", () => {
    it("harus berhasil mendapatkan semua capaian berdasarkan unit kerja ID", async () => {
      // Arrange
      const mockResult = [
        {
          id: 1,
          capaian: [
            {
              id: 1,
              nilai: 100,
              bulan: 1,
            },
          ],
          targetTriwulan: {
            id: 1,
            namaTarget: {
              id: 1,
              nama: "Target 1",
            },
          },
          tahunAnggaran: {
            id: 1,
            jenisAnggaran: {
              id: 1,
              jenis: "APBD",
            },
          },
          indikator: {
            id: 1,
            subKegPer: {
              id: 1,
              unitKerjaId: "1",
            },
          },
        },
      ];

      req.params.id = "1";
      target.findAll.mockResolvedValue(mockResult);

      // Act
      await capaianControllers.getAllCapaian(req, res);

      // Assert
      expect(target.findAll).toHaveBeenCalledWith({
        include: [
          { model: capaian, required: true },
          {
            model: targetTriwulan,
            include: [{ model: namaTarget }],
            required: true,
          },
          {
            model: tahunAnggaran,
            include: [{ model: jenisAnggaran }],
            required: true,
          },
          {
            model: indikator,
            required: true,
            include: [
              {
                model: subKegPer,
                where: { unitKerjaId: "1" },
                required: true,
                paranoid: true,
              },
            ],
          },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: mockResult });
    });

    it("harus mengembalikan error 500 jika terjadi kesalahan", async () => {
      // Arrange
      const mockError = new Error("Database connection error");
      req.params.id = "1";

      target.findAll.mockRejectedValue(mockError);

      // Act
      await capaianControllers.getAllCapaian(req, res);

      // Assert
      expect(target.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Database connection error",
      });
    });

    it("harus menggunakan unitKerjaId dari params untuk filter", async () => {
      // Arrange
      const mockResult = [];
      req.params.id = "5";

      target.findAll.mockResolvedValue(mockResult);

      // Act
      await capaianControllers.getAllCapaian(req, res);

      // Assert
      expect(target.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: indikator,
              include: expect.arrayContaining([
                expect.objectContaining({
                  model: subKegPer,
                  where: { unitKerjaId: "5" },
                }),
              ]),
            }),
          ]),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("terimaCapaian", () => {
    it("harus berhasil mengupdate status capaian", async () => {
      // Arrange
      const mockUpdateResult = [1]; // Sequelize update mengembalikan array [affectedRows]
      req.params.id = "1";
      req.body.status = "diterima";

      capaian.update.mockResolvedValue(mockUpdateResult);

      // Act
      await capaianControllers.terimaCapaian(req, res);

      // Assert
      expect(capaian.update).toHaveBeenCalledWith(
        { status: "diterima" },
        { where: { id: "1" } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: mockUpdateResult });
    });

    it("harus berhasil mengupdate status menjadi ditolak", async () => {
      // Arrange
      const mockUpdateResult = [1];
      req.params.id = "2";
      req.body.status = "ditolak";

      capaian.update.mockResolvedValue(mockUpdateResult);

      // Act
      await capaianControllers.terimaCapaian(req, res);

      // Assert
      expect(capaian.update).toHaveBeenCalledWith(
        { status: "ditolak" },
        { where: { id: "2" } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("harus mengembalikan error 500 jika terjadi kesalahan", async () => {
      // Arrange
      const mockError = new Error("Update failed");
      req.params.id = "1";
      req.body.status = "diterima";

      capaian.update.mockRejectedValue(mockError);

      // Act
      await capaianControllers.terimaCapaian(req, res);

      // Assert
      expect(capaian.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Update failed" });
    });

    it("harus menggunakan id dari params untuk update", async () => {
      // Arrange
      const mockUpdateResult = [1];
      req.params.id = "999";
      req.body.status = "diterima";

      capaian.update.mockResolvedValue(mockUpdateResult);

      // Act
      await capaianControllers.terimaCapaian(req, res);

      // Assert
      expect(capaian.update).toHaveBeenCalledWith(
        { status: "diterima" },
        { where: { id: "999" } }
      );
    });
  });
});
