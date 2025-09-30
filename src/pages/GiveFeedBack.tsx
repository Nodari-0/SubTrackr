import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

type FeedbackPayload = {
  feedback: string;
  email: string | null;
  user_id?: string;
};

function GiveFeedBack() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackList, setFeedbackList] = useState<FeedbackPayload[]>([]);

  // fetch feedback (optional, to show all feedback if needed)
  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("feedback, email, user_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feedback:", error.message);
    } else {
      setFeedbackList(data || []);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: FeedbackPayload = {
      feedback,
      email: email || user?.email || null,
      ...(user ? { user_id: user.id } : {}),
    };

    const { error } = await supabase.from("feedback").insert([payload]);

    if (error) {
      setError("Failed to send feedback. Please try again later.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
    setFeedback("");
    setEmail("");

    // refresh feedback list after insert
    fetchFeedback();
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded-lg shadow p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Give Feedback</h1>
      <p className="text-gray-600 mb-6">
        Share your feedback to help us improve the application.
      </p>

      {submitted ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded mb-4">
          Thank you for your feedback!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-2">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-medium mb-1"
            >
              Your Feedback *
            </label>
            <textarea
              id="feedback"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your feedback here..."
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
            >
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black cursor-pointer text-white font-semibold py-2 px-4 rounded transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Sending..." : "Submit Feedback"}
          </button>
        </form>
      )}

      {/* Optional: Display feedback list */}
      {/* {feedbackList.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Recent Feedback</h2>
          <ul className="space-y-2">
            {feedbackList.map((f, i) => (
              <li
                key={i}
                className="border border-gray-200 rounded p-2 bg-gray-50"
              >
                <p className="text-sm">{f.feedback}</p>
                {f.email && (
                  <p className="text-xs text-gray-500">– {f.email}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
}

export default GiveFeedBack;
