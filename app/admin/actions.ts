"use server";

import { cookies } from "next/headers";

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (username === "admin" && password === "admin") {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", "true", { path: "/", secure: process.env.NODE_ENV === "production", httpOnly: true });
    return { success: true };
  }

  return { error: "Invalid username or password" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  return { success: true };
}
