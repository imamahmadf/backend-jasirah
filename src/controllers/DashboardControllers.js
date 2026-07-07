const {
  getDashboardData,
  emitDashboardKPBPN,
} = require("../services/dashboardKPBPNService");

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const data = await getDashboardData();
      return res.status(200).json({ success: true, ...data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  refreshDashboardSocket: async (req, res) => {
    try {
      const io = req.app.get("socketio");
      const data = await emitDashboardKPBPN(io);
      return res.status(200).json({
        success: true,
        message: "Dashboard realtime berhasil diperbarui",
        timestamp: data?.timestamp || new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
