"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Test1234!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="mx-auto flex max-w-md flex-col px-4 py-10" style={{ paddingTop: "calc(24px + var(--safe-top))" }}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
          M
        </div>
        <h1 className="mt-4 text-center text-xl font-bold">MemberPass</h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          로그인하고 혜택을 누리세요
        </p>

        {sp.get("error") && (
          <div className="mt-4 rounded-xl border bg-red-50 p-3 text-sm text-red-700">
            로그인에 실패했어요. 이메일/비밀번호를 확인해주세요.
          </div>
        )}

        <div className="mt-8 space-y-3">
          <label className="block text-sm font-semibold">이메일</label>
          <input
            className="w-full rounded-xl border px-3 py-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <label className="block text-sm font-semibold">비밀번호</label>
          <input
            className="w-full rounded-xl border px-3 py-3 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="mt-2 w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError(null);
              const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
              });
              setLoading(false);
              if (res?.ok) router.push("/");
              else setError("로그인 실패");
            }}
          >
            {loading ? "로그인 중…" : "로그인"}
          </button>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
            <div className="font-semibold">테스트 계정</div>
            <div className="mt-1">test@example.com / Test1234!</div>
          </div>

          <div className="text-center text-sm text-slate-500">
            계정이 없으신가요?{" "}
            <Link className="font-semibold text-sky-700" href="/register">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
