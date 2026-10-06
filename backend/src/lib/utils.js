import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? "None" : "Lax",
    secure: isProduction,
  });

  return token;
};
