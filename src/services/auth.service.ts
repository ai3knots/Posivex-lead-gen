import { connectToDatabase } from "@/lib/db";
import { User, IUser } from "@/models/User";
import bcrypt from "bcryptjs";

/**
 * Ensures a default admin user exists if no users are in the database.
 */
export async function ensureDefaultAdmin(): Promise<IUser> {
  await connectToDatabase();

  let admin = await User.findOne({ email: "admin@posivex.com" });
  if (!admin) {
    const hashedPassword = await bcrypt.hash("Posivex@2026", 10);
    admin = await User.create({
      name: "Admin User",
      email: "admin@posivex.com",
      password: hashedPassword,
      role: "admin",
    });
  }

  return admin;
}

/**
 * Validates user credentials during NextAuth login.
 */
export async function validateCredentials(email?: string, password?: string) {
  if (!email || !password) return null;

  await connectToDatabase();
  await ensureDefaultAdmin();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.password) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Updates user profile information (Name, Email).
 */
export async function updateProfile(email: string, name: string) {
  await connectToDatabase();
  return User.findOneAndUpdate(
    { email },
    { $set: { name } },
    { new: true }
  );
}

/**
 * Changes user password with old password verification.
 */
export async function changePassword(
  email: string,
  currentPass: string,
  newPass: string
) {
  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user || !user.password) {
    throw new Error("User account not found");
  }

  const isValid = await bcrypt.compare(currentPass, user.password);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPass, 10);
  user.password = hashedPassword;
  await user.save();

  return true;
}
