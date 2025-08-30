import React, { useState } from "react";

interface AddAdminFormProps {
  onAdd: () => void;
}

const AddAdminForm: React.FC<AddAdminFormProps> = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add admin");
      setSuccess("Admin added successfully!");
      setName("");
      setEmail("");
      onAdd();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-center">{error}</div>}
      {success && <div className="text-green-600 text-center">{success}</div>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none transition-colors duration-300"
          placeholder="Enter admin name"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none transition-colors duration-300"
          placeholder="Enter admin email"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#8fbf6b] to-[#cfdf6f] text-white py-3 rounded-full font-medium hover:from-[#cfdf6f] hover:to-[#8fbf6b] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 transition-transform duration-200"
      >
        {loading ? "Adding..." : "Add Admin"}
      </button>
    </form>
  );
};

export default AddAdminForm;
