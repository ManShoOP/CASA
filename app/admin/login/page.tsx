"use client";

import { useState } from "react";
import { loginAdmin } from "../actions";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginAdmin(formData);
      if (result?.error) {
        setError(result.error === "Invalid credentials" ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" : result.error);
        setLoading(false);
      } else if (result?.success) {
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-light p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-border p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-terracotta-600 mb-2">CASA SOL</h1>
          <p className="text-charcoal-DEFAULT font-medium">เข้าสู่ระบบผู้ดูแลร้าน (Admin Portal)</p>
          <p className="text-xs text-muted-foreground mt-1">กรุณากรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าจัดการระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal-DEFAULT mb-2">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              type="text"
              name="username"
              required
              className="w-full h-12 px-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-sm"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-DEFAULT mb-2">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full h-12 px-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-charcoal-DEFAULT text-white font-medium hover:bg-charcoal-light transition-colors disabled:opacity-70 flex items-center justify-center shadow-sm"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ (Sign In)"}
          </button>
        </form>
      </div>
    </div>
  );
}
