import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";

interface Feedback {
  id: string;
  user_id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  rating: number;
  status: string;
  created_at: string;
}

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Feedback marked as ${status}`);
      fetchFeedbacks();
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback status");
    }
  };

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setDialogOpen(true);
  };

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Feedback</h1>
        <Button onClick={fetchFeedbacks} variant="outline">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border rounded">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <Table className="border border-gray-300">
          <TableCaption>All user feedback submissions</TableCaption>
          <TableHeader>
            <TableRow className="bg-black hover:bg-black">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Rating</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.map((feedback) => (
              <TableRow key={feedback.id} className="hover:bg-gray-100">
                <TableCell className="font-medium">{feedback.name}</TableCell>
                <TableCell>{feedback.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{feedback.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (feedback.rating || 5)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      feedback.status === "resolved"
                        ? "success"
                        : feedback.status === "pending"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {feedback.status || "pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(feedback.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(feedback)}
                    >
                      View
                    </Button>
                    {feedback.status !== "resolved" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(feedback.id, "resolved")}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && feedbacks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No feedback submitted yet
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Full details of the feedback submission
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4 text-black">
              <div>
                <p className="font-semibold">Name:</p>
                <p>{selectedFeedback.name}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedFeedback.email}</p>
              </div>
              <div>
                <p className="font-semibold">Category:</p>
                <p>{selectedFeedback.category}</p>
              </div>
              <div>
                <p className="font-semibold">Rating:</p>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (selectedFeedback.rating || 5)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold">Message:</p>
                <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <Badge
                  variant={
                    selectedFeedback.status === "resolved"
                      ? "success"
                      : "secondary"
                  }
                >
                  {selectedFeedback.status || "pending"}
                </Badge>
              </div>
              <div>
                <p className="font-semibold">Submitted:</p>
                <p>{new Date(selectedFeedback.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
