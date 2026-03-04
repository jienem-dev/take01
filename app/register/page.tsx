"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("테스트유저");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"M" | "F" | "Other">("Other");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="mx-auto flex max-w-md flex-col px-4 py-10" style={{ paddingTop: "calc(24px + var(--safe-top))" }}>
        <h1 className="text-xl font-bold">회원가입</h1>
        <p className="mt-1 text-sm text-slate-500">기본 정보로 계정을 생성합니다.</p>

        <div className="mt-6 space-y-3">
          <label className="block text-sm font-semibold">이름</label>
          <input className="w-full rounded-xl border px-3 py-3 text-sm" value={name} onChange={(e)=>setName(e.target.value)} />

          <label className="block text-sm font-semibold">이메일</label>
          <input className="w-full rounded-xl border px-3 py-3 text-sm" value={email} onChange={(e)=>setEmail(e.target.value)} />

          <label className="block text-sm font-semibold">성별</label>
          <select className="w-full rounded-xl border px-3 py-3 text-sm" value={gender} onChange={(e)=>setGender(e.target.value as any)}>
            <option value="M">남</option>
            <option value="F">여</option>
            <option value="Other">기타</option>
          </select>

          <label className="block text-sm font-semibold">비밀번호</label>
          <input className="w-full rounded-xl border px-3 py-3 text-sm" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />

          <button
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const res = await fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, email, gender, password }),
                });
                if (!res.ok) {
                  const d = await res.json().catch(()=>({}));
                  throw new Error(d?.error ?? "회원가입 실패");
                }
                router.push("/login");
              } catch (e: any) {
                setError(e.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "생성 중…" : "계정 만들기"}
          </button>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{" "}
            <Link className="font-semibold text-sky-700" href="/login">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
