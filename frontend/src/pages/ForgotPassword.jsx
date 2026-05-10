import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import AuthCard from "../shared/AuthCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Check your inbox if the account exists");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthCard title="Reset password" subtitle="We will send a reset token when email is configured.">
      <form onSubmit={submit} className="space-y-4">
        <input className="field" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn-primary w-full">Send reset link</button>
      </form>
    </AuthCard>
  );
}
