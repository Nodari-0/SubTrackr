import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
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

interface Issue {
  id: string;
  user_id: string;
  name: string;
  email: string;
  issue_type: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function AdminIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("issues")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Issue marked as ${status}`);
      fetchIssues();
    } catch (error) {
      console.error("Error updating issue:", error);
      toast.error("Failed to update issue status");
    }
  };

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reported Issues</h1>
        <Button onClick={fetchIssues} variant="outline">
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
          <TableCaption>All reported issues</TableCaption>
          <TableHeader>
            <TableRow className="bg-black hover:bg-black">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Priority</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id} className="hover:bg-gray-100">
                <TableCell className="font-medium">{issue.name}</TableCell>
                <TableCell>{issue.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{issue.issue_type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(issue.priority)}>
                    {issue.priority || "medium"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      issue.status === "resolved"
                        ? "success"
                        : issue.status === "in-progress"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {issue.status || "open"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(issue.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(issue)}
                    >
                      View
                    </Button>
                    {issue.status !== "resolved" && (
                      <>
                        {issue.status !== "in-progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(issue.id, "in-progress")
                            }
                          >
                            Start
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(issue.id, "resolved")}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && issues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No issues reported yet
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>
              Full details of the reported issue
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4 text-black">
              <div>
                <p className="font-semibold">Name:</p>
                <p>{selectedIssue.name}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedIssue.email}</p>
              </div>
              <div>
                <p className="font-semibold">Issue Type:</p>
                <p>{selectedIssue.issue_type}</p>
              </div>
              <div>
                <p className="font-semibold">Priority:</p>
                <Badge variant={getPriorityColor(selectedIssue.priority)}>
                  {selectedIssue.priority || "medium"}
                </Badge>
              </div>
              <div>
                <p className="font-semibold">Description:</p>
                <p className="whitespace-pre-wrap">{selectedIssue.description}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <Badge
                  variant={
                    selectedIssue.status === "resolved"
                      ? "success"
                      : selectedIssue.status === "in-progress"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedIssue.status || "open"}
                </Badge>
              </div>
              <div>
                <p className="font-semibold">Reported:</p>
                <p>{new Date(selectedIssue.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
