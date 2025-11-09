import { useRef, useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../hooks/auth";
import toast from "react-hot-toast";

export function Signup() {
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

  async function signup() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
      });
      toast.success("Account created! Signing you in...");
      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 411) {
        setError("Username already exists. Try another one.");
      } else {
        setError("Signup failed. Please try again.");
      }
      toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      signup();
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-black via-zinc-950 to-black flex justify-center items-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl shadow-2xl border border-zinc-800/50 backdrop-blur-xl w-full max-w-md p-8 flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-2">
            Join Brainly
          </h1>
          <p className="text-zinc-500 text-sm">
            Create your second brain today
          </p>
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
              placeholder="Choose a username"
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
              placeholder="Create a strong password"
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-600 transition-all"
              onKeyPress={handleKeyPress}
            />
            <p className="text-zinc-600 text-xs mt-1">
              Min 6 characters recommended
            </p>
          </div>
        </div>

        <div className="w-full">
          <Button
            onClick={signup}
            variant="primary"
            text={loading ? "Creating account..." : "Sign Up"}
            fullWidth
            loading={loading}
          />
        </div>

        <p className="text-zinc-500 text-sm mt-6 text-center">
          Already have an account?{" "}
          <span
            className="text-white font-semibold cursor-pointer hover:text-zinc-300 transition-colors"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mt-6"></div>

        <div className="text-zinc-600 text-xs mt-4 space-y-1 text-center">
          <p>✨ Save Twitter & YouTube content</p>
          <p>🔍 Search & organize instantly</p>
          <p>🔗 Share your brain with others</p>
        </div>
      </div>
    </div>
  );
}
