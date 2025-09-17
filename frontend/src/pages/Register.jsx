import axios from 'axios'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function Register({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function sendRequest(event) {
        event.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
            const result = await axios.post(`${baseUrl}/auth/register`, { email, password });
            if (result.status === 201) {
                setEmail("");
                setPassword("");
                navigate("/auth/login")
            } else {
                console.log(`Registration error ${result.status}`);
            }
        }
        catch (e) {
            if (e.response) {
                const status = e.response.status;
                if (status === 409) alert("Email already in use.");
                else if (status === 422) alert("Invalid email or password.");
                else if (status >= 500) alert("Server error, please try again later.");
                else alert("Registration error.");
            } else {
                alert("Unable to reach the server.");
            }
        }

    }
    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={sendRequest}>
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default Register