"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const token = useSearchParams().get("token");
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setMessage("No token found.");
      return;
    }

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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", marginTop: "100px" }}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}