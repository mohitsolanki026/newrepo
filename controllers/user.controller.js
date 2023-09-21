import bcrpyt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import sendOTP from "../utils/sendOTP.utils.js";
import cardModel from "../models/card.model.js";

const routes = {};

routes.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrpyt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.signup = async (req, res) => {
  const { name, email, mobile, gender } = req.body;
  try {
    const ifUser = await UserModel.findOne({ email });
    if (ifUser && ifUser.isVerified)
      return res.status(400).json({ error: "User already exists" });

    // unique number
    const uniqueNumberid = await UserModel.find({ mobile: mobile });
    if (uniqueNumberid.length > 0)
      return res.status(400).json({ error: "Mobile number already exists" });

    if (ifUser && !ifUser.isVerified) UserModel.findByIdAndDelete(ifUser._id);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const otpresult = await sendOTP(email, otp, "Verify your email");

    if (!otpresult.messageId)
      return res.status(500).json({ error: "Something went wrong with OTP" });

    const result = await UserModel.create({
      name,
      email,
      mobile,
      gender,
      otp,
      otpExpires,
    });

    res
      .status(201)
      .json({ result, success: "OTP has been sent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.verfyOtp = async (req, res) => {
  const { id } = req.query;
  const { otp } = req.body;

  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ error: "OTP expired" });

    if (user.otp != otp) return res.status(400).json({ error: "Invalid OTP" });

    user.isVerified = true;
     await user.save();

    res.status(200).json({ success: "Verified" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.resendOtp = async (req, res) => {
  const { id } = req.query;
  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if(user.isVerified) return res.status(404).json({error:"user already verified"});

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const otpresult = await sendOTP(user.email, otp, "Verify your email");

    if (!otpresult.messageId)
      return res.status(500).json({ error: "Something went wrong with OTP" });

    user.otp = otp;
    user.otpExpires = otpExpires;

     await user.save();
    return res
      .status(201)
      .json({ success: "OTP has been sent to your email" });
  } catch (error) {
    res.send(500).json({ error: "something went wrong" });
  }
};

routes.submitDocument = async(req,res)=>{
    try {
        const {id} = req.query;
        const {document, documentNumber} = req.body;

        const user = await UserModel.findById(id);
        if(!user) return res.status(404).json({error: "user not found"});

        user.document = document;
        user.documentNumber = documentNumber;
        await user.save();
    
    
        return res.status(200).json({ success: "document upload" });


    } catch (error) {
        return res.send(500).json({error:"something went wrong"});
    }
}

routes.getBalance = async(req,res) =>{
    try {
        const {id} = req.query

        const user = await UserModel.findById(id);
        if(!user) return res.status(404).json({error: "user not found"});

        return res.status(200).json({ Balance: user.balance });

    } catch (error) {
        return res.status(500).json({error: "something went wrong"});
    }
}

routes.addCard = async(req,res) => {
    try {
        const {id} = req.query;
        const {name, number, cvv, expires} = req.body;

        const user = await UserModel.findById(id);
        if(!user) return res.status(404).json({error: "user not found"});

        // if(user.card)

        const card = await cardModel.create({name, number, cvv, expires});
        console.log(card);
        user.card = card

        const result = await user.save();
        return res.status(200).json({result });


    } catch (error) {
        return res.status(500).json({error: "something went wrong"});
    }
}

export default routes;
