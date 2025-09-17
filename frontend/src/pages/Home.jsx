import axios from "axios"
import { useState, useEffect } from "react";

function Home() {
    const [contacts, setContacts] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContact, setNewContact] = useState({
        firstName: "",
        lastName: "",
        phone: ""
    });

    useEffect(() => {
        const isConnected = localStorage.getItem("isConnected") === "true";
        const token = localStorage.getItem("token");
        
        if (!token || !isConnected) {
            localStorage.setItem("isConnected", "false");
            setConnectionStatus(false);
            return;
        }
        
        setConnectionStatus(true);
        fetchContacts(token);
    }, []);

    async function fetchContacts(token) {
        try {
            const headers = {
                "Authorization": `Bearer ${token}`
            };
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
            const response = await axios.get(`${baseUrl}/contacts`, { headers });
            const contactsData = response.data.contacts || [];            
            setContacts(contactsData);
        } catch (e) {
            if (e.response) {
                if (e.response.status === 401) {
                    alert("Session expired, please log in again.");
                    localStorage.setItem("isConnected", "false");
                } else if (e.response.status >= 500) {
                    alert("Server error, please try again later.");
                }
            } else {
                alert("Unable to reach the server.");
            }
            setContacts([]);
        }
    }

    async function addContact() {
        try {
            const token = localStorage.getItem("token");
            const headers = {
                "Authorization": `Bearer ${token}`
            };
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
            await axios.post(`${baseUrl}/contacts`, newContact, { headers });
            setNewContact({ firstName: "", lastName: "", phone: "" });
            setShowAddForm(false);
            fetchContacts(token);
        } catch (e) {
            if (e.response) {
                const s = e.response.status;
                if (s === 400) alert("All fields are required.");
                else if (s === 401) alert("Session expired.");
                else if (s >= 500) alert("Server error.");
            } else {
                alert("Unable to reach the server.");
            }
        }
    }

    async function deleteContact(contactId) {
        try {
            const token = localStorage.getItem("token");
            const headers = {
                "Authorization": `Bearer ${token}`
            };
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
            await axios.delete(`${baseUrl}/contacts/${contactId}`, { headers });
            setContacts(contacts.filter(contact => contact._id !== contactId));
        } catch (e) {
            if (e.response) {
                const s = e.response.status;
                if (s === 404) alert("Contact not found.");
                else if (s === 403) alert("Not authorized.");
                else if (s >= 500) alert("Server error.");
            } else {
                alert("Unable to reach the server.");
            }
        }
    }

    async function updateContact(contactId) {
        const newFirstName = prompt("New first name (leave empty to keep):");
        if (newFirstName === null) return;

        const newLastName = prompt("New last name (leave empty to keep):");
        if (newLastName === null) return;

        const newPhone = prompt("New phone (leave empty to keep):");
        if (newPhone === null) return;

        const updatedData = {};
        if (newFirstName !== "") updatedData.firstName = newFirstName;
        if (newLastName !== "") updatedData.lastName = newLastName;
        if (newPhone !== "") updatedData.phone = newPhone;

        if (Object.keys(updatedData).length === 0) return;

        try {
            const token = localStorage.getItem("token");
            const headers = {
                "Authorization": `Bearer ${token}`
            };
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
            await axios.patch(`${baseUrl}/contacts/${contactId}`, updatedData, { headers });
            fetchContacts(token);
        } catch (e) {
            if (e.response) {
                const s = e.response.status;
                if (s === 400) alert("Invalid data.");
                else if (s === 404) alert("Contact not found.");
                else if (s === 403) alert("Not authorized.");
                else if (s >= 500) alert("Server error.");
            } else {
                alert("Unable to reach the server.");
            }
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewContact({
            ...newContact,
            [name]: value
        });
    };

    if (!connectionStatus) {
        return (
            <div>
                <h2>Home</h2>
                <p>This is a website to manage phone contacts, please login</p>
            </div>
        );
    }

    return (
        <div id="contactsList">
            <h2>Contacts:</h2>
            
            <button onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? "Cancel" : "Add contact"}
            </button>
            
            {showAddForm && (
                <div key="add-form">
                    <h3>New contact</h3>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={newContact.firstName}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={newContact.lastName}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={newContact.phone}
                        onChange={handleInputChange}
                    />
                    <button onClick={addContact}>Add</button>
                </div>
            )}
            
            {contacts.length === 0 ? (
                <p>No contacts</p>
            ) : (
                <div>
                    {contacts.map((contact) => (
                        <div key={contact._id || Math.random()} data-id={contact._id}>
                            <h3>{contact.firstName} {contact.lastName}</h3>
                            <p>{contact.phone}</p>
                            <button onClick={() => updateContact(contact._id)}>Edit</button>
                            <button onClick={() => deleteContact(contact._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;