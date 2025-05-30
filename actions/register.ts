/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/schemas";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const register = async (values: import("zod").infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input", success: "" };
  }

  const { username, email, password } = validatedFields.data;

  try {
    const client = await clientPromise;
    const db = client.db(); // Default DB from URI

    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return { error: "Email already in use", success: "" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      email,
      password: hashedPassword,
      profilePicture: "", // Default empty string
      resetToken: "", // Default empty string
      tokenExpiryDate: new Date(), // Will be updated when token is generated
      role: "user", // Default role
      loginAttempts: 0, // Initialize login attempts
      lockUntil: null, // No lock initially
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection("users").insertOne({
      newUser
    });
    
    // Return user data without sensitive fields
    const { password: _, resetToken, ...userWithoutSensitiveData } = newUser;

    return NextResponse.json(
      { 
        message: "User registered successfully.",
        user: userWithoutSensitiveData 
      },
      { status: 201 }
    );
    } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong", success: "" };
  }
};
