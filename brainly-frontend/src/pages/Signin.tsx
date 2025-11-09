import { useRef, useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../hooks/auth";
import toast from "react-hot-toast";

export function Signin() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  async function signin() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    setError("");

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
      toast.error("Signin failed");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      signin();
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-black via-zinc-950 to-black flex justify-center items-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl shadow-2xl border border-zinc-800/50 backdrop-blur-xl w-full max-w-md p-8 flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-500 text-sm">Sign in to your Brainly account</p>
        </div>

        {error && (
          <div className="w-full mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 w-full mb-6">
          <div>
            <label className="text-zinc-400 text-sm font-medium mb-2 block">
              Username
            </label>
            <Input
              reference={usernameRef}
              placeholder="Enter your username"
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-600 transition-all"
              //@ts-ignore
              onKeyPress={handleKeyPress}
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="Enter your password"
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-600 transition-all"
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="w-full">
          <Button
            onClick={signin}
            variant="primary"
            text={loading ? "Signing in..." : "Sign In"}
            fullWidth
            loading={loading}
          />
        </div>

        <p className="text-zinc-500 text-sm mt-6 text-center">
          Don't have an account?{" "}
          <span
            className="text-white font-semibold cursor-pointer hover:text-zinc-300 transition-colors"
            onClick={() => navigate("/")}
          >
            Sign Up
          </span>
        </p>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mt-6"></div>

        <p className="text-zinc-600 text-xs mt-4 text-center">
          💡 Tip: Use Cmd/Ctrl + K in dashboard to quickly add content
        </p>
      </div>
    </div>
  );
}
