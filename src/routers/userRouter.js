const express = require("express");
const { userControllers } = require("../controllers");
const { authenticateUser, authorizeRole } = require("../lib/auth");
const fileUploader = require("../middleware/uploader");

const router = express.Router();

// Public routes (tidak butuh login)
router.post("/post/user-role", userControllers.addRole);
router.post("/delete/user-role", userControllers.deleteRole);
router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.get("/get-role", userControllers.getRole);
router.get("/get/user", userControllers.getAllUser);
// Protected routes (harus login)
router.post("/logout", authenticateUser, userControllers.logout);
router.get("/check-auth", authenticateUser, (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
});
router.get("/profile/:id", userControllers.getProfile);
router.post(
  "/change-password",
  authenticateUser,
  userControllers.changePassword
);
router.post("/update-password/:id", userControllers.updatePassword);
router.post(
  "/profile/photo",
  authenticateUser,
  fileUploader({
    destinationFolder: "profile",
    fileType: "image",
    prefix: "PROFILE",
  }).single("photo"),
  userControllers.uploadProfilePhoto
);

// Admin-only routes (harus login DAN role admin)
router.get(
  "/admin-dashboard",
  authenticateUser,
  authorizeRole(["admin"]),
  userControllers.adminDashboard
);
router.post("/delete/:id", userControllers.deleteUser);

module.exports = router;
