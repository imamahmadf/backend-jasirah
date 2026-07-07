const express = require("express");
const { userKPBPNControllers } = require("../controllers");
const { authenticateUser, authorizeRole } = require("../lib/auth");
const fileUploader = require("../middleware/uploader");

const router = express.Router();

// Public routes (tidak butuh login)
router.post("/post/user-role", userKPBPNControllers.addRole);
router.post("/delete/user-role", userKPBPNControllers.deleteRole);
router.post("/register", userKPBPNControllers.register);
router.post("/login", userKPBPNControllers.login);
router.get("/get-role", userKPBPNControllers.getRole);
// router.get("/get/user", userKPBPNControllers.getAllUser);
// Protected routes (harus login)
router.post("/logout", authenticateUser, userKPBPNControllers.logout);
router.get("/check-auth", authenticateUser, (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
});
router.get("/profile/:id", userKPBPNControllers.getProfile);
router.post(
  "/change-password",
  authenticateUser,
  userKPBPNControllers.changePassword,
);
router.post("/update-password/:id", userKPBPNControllers.updatePassword);
router.get("/get/user", userKPBPNControllers.getAllUser);
// Admin-only routes (harus login DAN role admin)
// router.get(
//   "/admin-dashboard",
//   authenticateUser,
//   authorizeRole(["admin"]),
//   userKPBPNControllers.adminDashboard,
// );
// router.post("/delete/:id", userKPBPNControllers.deleteUser);

module.exports = router;
