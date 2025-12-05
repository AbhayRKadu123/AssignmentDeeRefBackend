import UserModel from "../Models/UserModel.js"
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

 const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({ err: "Email and Password are required" });
    }

    // 2. Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ err: "Invalid Credentials" });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      'MYSECRETKEY',
      { expiresIn: "7d" }
    );

    // 5. Send response
    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.log("Login Error:", err);
    return res.status(500).json({ err: "Server error" });
  }
}

const SignUp = async (req, res) => {
  console.log("signup route", req.body);

  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ err: "All fields are required" });
    }

    // Check if user already exists by email
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(409).json({ err: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ msg: "Signup successful" });

  } catch (err) {
    console.log("error:", err);
    return res.status(500).json({ err: "Server error" });
  }
};


export { Login, SignUp }