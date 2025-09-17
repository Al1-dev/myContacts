import axios from 'axios'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    async function sendRequest(event) {
        event.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
            const result = await axios.post(`${baseUrl}/auth/login`, { email, password });
            if (result && result.data.token) {
                setEmail("");
                setPassword("");
                localStorage.setItem("token", result.data.token);
                localStorage.setItem("isConnected",true)
                if (typeof onLogin === 'function') onLogin();
                navigate("/")
            } else {
                console.log(`Login error ${result.status}`);
            }
        }
        catch (e) {
            if (e.response) {
                const status = e.response.status;
                if (status === 401) alert("Invalid email or password.");
                else if (status === 422) alert("Invalid data.");
                else if (status >= 500) alert("Server error, please try again later.");
                else alert("Login error.");
            } else {
                alert("Unable to reach the server.");
            }
        }

    }
    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={sendRequest}>
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login