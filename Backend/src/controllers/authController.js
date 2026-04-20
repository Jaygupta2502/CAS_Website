import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ SIGNUP
export const signup = async (req, res) => {
  const { name, email, employeeId, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    employeeId,
    password: hashed,
    role: "faculty"
  });

  res.json({ message: "User created successfully" });
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    console.log("LOGIN INPUT:", cleanEmail, cleanPassword);

    // 🔥 ADMIN LOGIN
    if (
      cleanEmail === "admin@mituniversity.edu.in" &&
      cleanPassword === "admin123"
    ) {
      console.log("ADMIN LOGIN SUCCESS");

      const token = jwt.sign(
        { id: "admin-id", role: "admin" },
        process.env.JWT_SECRET
      );

      return res.json({
        token,
        user: {
          _id: "admin-id",
          name: "Admin",
          email: cleanEmail,
          role: "admin"
        }
      });
    }

    // 👇 NORMAL USER LOGIN
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(cleanPassword, user.password);

    if (!match) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ token, user });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};