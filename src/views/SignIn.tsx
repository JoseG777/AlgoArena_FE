import { useState } from "react";

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
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

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
