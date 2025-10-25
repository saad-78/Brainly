import { useRef, useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../hooks/auth";
export function Signin() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/dashboard");
        }
    }, [navigate]);

    async function signin() {
        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;

        if (!username || !password) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, { username, password });
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard");
        } catch {
            alert("Signin failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen w-screen bg-purple-50 flex justify-center items-center">
            <div className="bg-white rounded-3xl shadow-xl border border-purple-200 w-full max-w-sm p-8 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-purple-700 mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    Sign In
                </h1>
                <div className="flex flex-col gap-4 w-full">
                    <Input reference={usernameRef} placeholder="Username" className="w-full" />
                    <Input reference={passwordRef} placeholder="Password" className="w-full" />
                </div>
                <div className="w-full mt-6">
                    <Button
                        onClick={signin}
                        variant="primary"
                        text={loading ? "Signing in..." : "Sign In"}
                        fullWidth
                    />
                </div>
                <p className="text-gray-500 text-sm mt-4">
                    Don't have an account? <span className="text-purple-600 cursor-pointer" onClick={() => navigate("/")}>Sign Up</span>
                </p>
            </div>
        </div>
    );
}
