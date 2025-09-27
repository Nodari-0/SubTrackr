type IssuePayload = {
  description: string;
  email: string | null;
  user_id?: string;
};

import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const categories = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature Request" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" },
];

function ReportIssue() {
  const { user } = useAuth();
  const [category, setCategory] = useState("bug");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let table = "";
    if (category === "bug") table = "bug_reports";
    else if (category === "feature") table = "feature_requests";
    else if (category === "support") table = "support_requests";
    else table = "other_issues";

    const payload: IssuePayload = {
      description,
      email: email || user?.email || null,
      ...(user ? { user_id: user.id } : {}),
    };

    const { error } = await supabase.from(table).insert([payload]);
    if (error) {
      setError("Failed to submit issue. Please try again later.");
      setLoading(false);
      return;
    }
    setSubmitted(true);
    setLoading(false);
    setCategory("bug");
    setDescription("");
    setEmail("");
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
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category *</label>
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