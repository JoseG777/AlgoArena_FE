import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LoginFormData {
  identifyingInput: string;
  password: string;
}

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    identifyingInput: "",
    password: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      await refreshUser();
      navigate("/test");

      setMessage(data.message || "Login successful!");
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="identifyingInput">Email or Username</label>
      <input
        id="identifyingInput"
        name="identifyingInput"
        type="text"
        value={formData.identifyingInput}
        onChange={handleChange}
        required
      />
      <br />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <br />

      <button type="submit">Login</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SignIn;
