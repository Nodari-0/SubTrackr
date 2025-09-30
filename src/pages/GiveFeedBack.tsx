
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

type FeedbackPayload = {
  name: string;
  email: string;
  category: string;
  message: string;
  user_id?: string;
};

function GiveFeedBack() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const userName = name || user?.user_metadata?.full_name || user?.email || "Anonymous";
    const userEmail = email || user?.email || "no-email@example.com";

    const payload: FeedbackPayload = {
      name: userName,
      email: userEmail,
      category,
      message: feedback,
      ...(user ? { user_id: user.id } : {}),
    };
    const { error } = await supabase.from("feedback").insert([payload]);
    if (error) {
      console.error("Feedback error:", error);
      setError("Failed to send feedback. Please try again later.");
      setLoading(false);
      return;
    }
    setSubmitted(true);
    setLoading(false);
    setFeedback("");
    setEmail("");
    setName("");
    setCategory("general");
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded-lg shadow p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Give Feedback</h1>
      <p className="text-gray-600 mb-6">Share your feedback to help us improve the application.</p>
      {submitted ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded mb-4">Thank you for your feedback!</div>
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
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category *</label>
            <select
              id="category"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="general">General</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement</option>
              <option value="praise">Praise</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium mb-1">Your Feedback *</label>
            <textarea
              id="feedback"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              rows={4}
              required
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Type your feedback here..."
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
            className="w-full bg-black cursor-pointer text-white font-semibold py-2 px-4 rounded transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Sending..." : "Submit Feedback"}
          </button>
        </form>
      )}
    </div>
  );
}

export default GiveFeedBack