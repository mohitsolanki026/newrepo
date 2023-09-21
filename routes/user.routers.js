import express from "express";
import userController from "./../controllers/user.controller.js";
const router = express.Router();

router.post("/signin",userController.login);
router.post("/signup",userController.signup);
router.post("/verifyOtp", userController.verfyOtp);
router.get("/resendOtp", userController.resendOtp);
router.post("/uploadDoc",userController.submitDocument);
router.get("/balance",userController.getBalance);
router.post("/addCard",userController.addCard);

export default router