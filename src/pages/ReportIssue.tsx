import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

type IssuePayload = {
  name: string;
  email: string;
  issue_type: string;
  description: string;
  priority: string;
  user_id?: string;
};

const categories = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature Request" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function ReportIssue() {
  const { user } = useAuth();
  const [category, setCategory] = useState("bug");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const userName = name || user?.user_metadata?.full_name || user?.email || "Anonymous";
    const userEmail = email || user?.email || "no-email@example.com";

    const payload: IssuePayload = {
      name: userName,
      email: userEmail,
      issue_type: category,
      description,
      priority,
      ...(user ? { user_id: user.id } : {}),
    };

    const { error } = await supabase.from("issues").insert([payload]);
    if (error) {
      console.error("Issue submission error:", error);
      setError("Failed to submit issue. Please try again later.");
      setLoading(false);
      return;
    }
    setSubmitted(true);
    setLoading(false);
    setCategory("bug");
    setDescription("");
    setEmail("");
    setName("");
    setPriority("medium");
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded-lg shadow  p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Report Issue</h1>
      <p className="text-gray-600 mb-6">Report any issues, bugs, or support requests you encounter while using the application.</p>
      {submitted ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded mb-4">Thank you for reporting the issue!</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-2">{error}</div>
          )}
          {!user && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name *</label>
              <input
                id="name"
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                required={!user}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Issue Type *</label>
            <select
              id="category"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority *</label>
            <select
              id="priority"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              required
            >
              {priorities.map(pri => (
                <option key={pri.value} value={pri.value}>{pri.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              id="description"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue or request in detail..."
            />
          </div>
          {!user && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email (optional)</label>
              <input
                id="email"
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-black cursor-pointer  text-white font-semibold py-2 px-4 rounded transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Sending..." : "Submit Issue"}
          </button>
        </form>
      )}
    </div>
  );
}

export default ReportIssue