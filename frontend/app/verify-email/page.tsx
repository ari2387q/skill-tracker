"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const token = useSearchParams().get("token");
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!token) return setMessage("No token found.");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Something went wrong."));
  }, [token]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <p>{message}</p>
      <Link href="/login">Go to Login</Link>
    </div>
  );
}