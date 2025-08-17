
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });
  const user = await User.create({ name, email, password, role: "employee" });
  const token = generateToken(user);
  res.status(201).json({
    token, user: { id: user._id, name: user.name, email: user.email, role: user.role, leaveBalance: user.leaveBalance }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const match = await user.matchPassword(password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });
  const token = generateToken(user);
  res.json({
    token, user: { id: user._id, name: user.name, email: user.email, role: user.role, leaveBalance: user.leaveBalance }
  });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
