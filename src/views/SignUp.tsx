import { useState } from "react";

interface SignUpFormData {
    username: string;
    email: string;
    password: string; // In the backend the corresponding field is passwordHash. The users password is hashed in the backend
    confirmedPassword: string;
}

const SignUp: React.FC = ()=>
{
    const [formData, setFormData] = useState<SignUpFormData>(
        {
            username: "",
            email: "",
            password: "",
            confirmedPassword: ""
        }
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) : void => {
        const { name, value } = e.target; // this will pull fields from the <input.../> part of the form, we can deconstruct and pull specific values
        setFormData((prev) => ({...prev, [name]: value}))
        // console.log(formData);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) : Promise<void> => {
        e.preventDefault();
        if(formData.password !== formData.confirmedPassword)
        {
            console.log("Please ensure passwords match!");
        }

        try {
            const res = await fetch("http://localhost:3001/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            }),
            });

            if (!res.ok) {
            const data = await res.json();
            console.error("Error:", data.error);
            return;
            }

            console.log("User created successfully");
            setFormData({ username: "", email: "", password: "", confirmedPassword: "" });
        } catch (err) {
            console.error(err);
        }
    }

    return(
    <form onSubmit={handleSubmit}>
        <label htmlFor="username"> Username </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <br/>
        <label htmlFor="email"> Email </label>
        <input
          id="email"
          name="email"
          type="text"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <br/>
        <label htmlFor="password"> Password </label>
        <input
          id="password"
          name="password"
          type="text"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <br/>
        <label htmlFor="confirmedPassword"> Confirm Password </label>
        <input
          id="confirmedPassword"
          name="confirmedPassword"
          type="text"
          value={formData.confirmedPassword}
          onChange={handleChange}
          required
        />

        <br/>
        <button type="submit"/>
    </form>
    );
}

export default SignUp;