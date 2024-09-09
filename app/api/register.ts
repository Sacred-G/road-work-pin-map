import { NextApiRequest, NextApiResponse } from "next";
import { createUser } from "../../lib/actions";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      // Hash the password before storing it
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create the user in the database
      const user = await createUser(email, name, "", hashedPassword);

      if (user) {
        return res.status(201).json({ message: "User registered successfully" });
      } else {
        return res.status(500).json({ error: "User registration failed" });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
