"use client";

import  { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

const Limits = () => {
  // -------------------------
  // State declarations
  // -------------------------
  const [limits, setLimits] = useState([]); // Stores user's limits
  const [transactions, setTransactions] = useState([]); // Stores user's transactions
  const [loading, setLoading] = useState(true); // Loading state for UI feedback

  // Dialog and form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedLimitId, setExpandedLimitId] = useState(null); // Currently expanded limit in collapsible
  const [categoryInput, setCategoryInput] = useState(""); // Input value for category
  const [amountInput, setAmountInput] = useState(""); // Input value for amount
  const [limitBeingEdited, setLimitBeingEdited] = useState(null); // Limit currently being edited

  // -------------------------
  // Dummy data for logged-out users
  // -------------------------
  const dummyLimits = [
    { id: "1", category: "Food", amount: 940, created_at: new Date().toISOString() },
    { id: "2", category: "Travel", amount: 200, created_at: new Date().toISOString() },
  ];

  const dummyTransactions = [
    { id: "t1", category: "Food", amount: 76.9, type: "expense", created_at: new Date().toISOString() },
    { id: "t2", category: "Travel", amount: 44, type: "expense", created_at: new Date().toISOString() },
  ];

  // -------------------------
  // Fetch data from Supabase
  // -------------------------
  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Use dummy data if user is not logged in
    if (!user) {
      setLimits(dummyLimits);
      setTransactions(dummyTransactions);
      setLoading(false);
      return;
    }

    // Fetch limits from database
    const { data: limitsData, error: limitsError } = await supabase
      .from("limits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch expense transactions from database (case-insensitive)
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .ilike("type", "expense");

    // Handle errors or set fetched data
    if (limitsError) {
      console.error("Fetch limits error:", limitsError);
      setLimits(dummyLimits);
    } else {
      setLimits(limitsData || []);
    }

    if (transactionsError) {
      console.error("Fetch transactions error:", transactionsError);
      setTransactions(dummyTransactions);
    } else {
      setTransactions(transactionsData || []);
    }

    setLoading(false);
  };

  // Fetch data once when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------
  // Real-time subscription to transactions
  // -------------------------
  useEffect(() => {
    const channel = supabase
      .channel("transactions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        (payload) => {
          console.log("Transactions changed:", payload);

          // Update transactions state based on event type
          setTransactions((prev) => {
            const newTransaction = payload.new;
            const oldTransaction = payload.old;

            switch (payload.eventType) {
              case "INSERT":
                return [newTransaction, ...prev]; // Add new transaction
              case "UPDATE":
                return prev.map((t) =>
                  t.id === newTransaction.id ? newTransaction : t
                ); // Update existing transaction
              case "DELETE":
                return prev.filter((t) => t.id !== oldTransaction.id); // Remove deleted transaction
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => supabase.removeChannel(channel);
  }, []);

  // -------------------------
  // Calculate total spent for a category this month
  // -------------------------
  const calculateSpent = (category) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalSpent = transactions
      .filter((transaction) => {
        if (!transaction.category) return false; // Skip if no category
        const transactionDate = new Date(transaction.created_at);
        const categoryMatches = transaction.category.toLowerCase().trim() === category.toLowerCase().trim();
        const isExpense = transaction.type?.toLowerCase() === "expense";
        const isThisMonth = transactionDate >= firstDayOfMonth;
        return categoryMatches && isExpense && isThisMonth;
      })
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);

    return totalSpent;
  };

  // -------------------------
  // Calculate days remaining in the month
  // -------------------------
  const calculateDaysLeft = () => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.max(1, lastDayOfMonth.getDate() - now.getDate() + 1);
  };

  // -------------------------
  // Save or update a limit
  // -------------------------
  const handleSaveLimit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    if (!categoryInput || !amountInput) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (limitBeingEdited) {
      // Update existing limit
      await supabase
        .from("limits")
        .update({ category: categoryInput, amount: parseFloat(amountInput) })
        .eq("id", limitBeingEdited.id)
        .eq("user_id", user.id);
    } else {
      // Insert new limit
      await supabase.from("limits").insert([
        { 
          user_id: user.id, 
          category: categoryInput, 
          amount: parseFloat(amountInput), 
          created_at: new Date().toISOString() 
        },
      ]);
    }

    await fetchData(); // Refresh data
    setCategoryInput("");
    setAmountInput("");
    setLimitBeingEdited(null);
    setIsDialogOpen(false);
  };

  // -------------------------
  // Delete a limit
  // -------------------------
  const handleDeleteLimit = async (limitId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("limits").delete().eq("id", limitId).eq("user_id", user.id);
    setLimits(limits.filter((limit) => limit.id !== limitId));
  };

  // -------------------------
  // Open edit dialog
  // -------------------------
  const openEditDialog = (limit) => {
    setLimitBeingEdited(limit);
    setCategoryInput(limit.category);
    setAmountInput(limit.amount.toString());
    setIsDialogOpen(true);
  };

  // -------------------------
  // Open add dialog
  // -------------------------
  const openAddDialog = () => {
    setLimitBeingEdited(null);
    setCategoryInput("");
    setAmountInput("");
    setIsDialogOpen(true);
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="flex flex-col w-full">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Limits</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="cursor-pointer">+</Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px] text-black">
            <form onSubmit={handleSaveLimit}>
              <DialogHeader>
                <DialogTitle>{limitBeingEdited ? "Edit Limit" : "Add Limit"}</DialogTitle>
                <DialogDescription>
                  {limitBeingEdited
                    ? "Update this category limit."
                    : "Set a monthly spending limit for a category."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 mt-4">
                {/* Category input */}
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="e.g., Food, Travel, Entertainment"
                    required
                  />
                </div>
                
                {/* Amount input */}
                <div className="grid gap-2">
                  <Label htmlFor="amount">Monthly Limit</Label>
                  <Input
                    id="amount"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="cursor-pointer">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="cursor-pointer">{limitBeingEdited ? "Update" : "Save"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </div>
      ) : limits.length === 0 ? (
        // Empty state
        <div className="text-center py-8 text-gray-500">
          <p>No limits set yet. Click "Add Limit" to create one.</p>
        </div>
      ) : (
        // List of limits
        <div className="space-y-2 ">
          {limits.map((limit) => {
            // Calculate spending stats for this limit
            const spent = calculateSpent(limit.category);
            const remaining = limit.amount - spent;
            const spentPercentage = Math.min((spent / limit.amount) * 100, 100);
            const daysLeft = calculateDaysLeft();
            const dailyBudget = Math.max(0, remaining) / daysLeft;
            const isExpanded = expandedLimitId === limit.id;
            const isOverspent = spent > limit.amount;

            // Determine progress bar color
            let progressColor = "bg-green-500";
            if (spentPercentage >= 90 || isOverspent) {
              progressColor = "bg-red-500";
            } else if (spentPercentage >= 50) {
              progressColor = "bg-orange-500";
            }

            return (
              <Collapsible
                key={limit.id}
                open={isExpanded}
                onOpenChange={() => setExpandedLimitId(isExpanded ? null : limit.id)}
                className="border rounded-lg"
              >
                <CollapsibleTrigger className="w-full p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-left">
                      {/* Category name and remaining amount */}
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{limit.category}</span>
                        <span className={`font-semibold text-sm ${isOverspent ? "text-red-600" : ""}`}>
                          ${Math.abs(remaining).toFixed(2)} {isOverspent ? "over" : "left"}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all ${progressColor}`}
                          style={{ width: `${spentPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Expand/collapse icon */}
                    <div className="ml-3">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                {/* Expanded limit details */}
                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-2 border-t bg-gray-50">
                    {/* Spending details */}
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total limit:</span>
                        <span className="font-semibold">${limit.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spent this month:</span>
                        <span className={`font-semibold ${isOverspent ? "text-red-600" : ""}`}>
                          ${spent.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily budget:</span>
                        <span className="font-semibold">${dailyBudget.toFixed(2)}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days remaining:</span>
                        <span className="font-semibold">{daysLeft} days</span>
                      </div>
                      
                      {/* Overspending warning */}
                      {isOverspent && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                          ⚠️ You've exceeded your limit by ${Math.abs(remaining).toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button onClick={() => openEditDialog(limit)} variant="outline" className="flex-1 cursor-pointer">
                        Edit
                      </Button>
                      <Button onClick={() => handleDeleteLimit(limit.id)} variant="destructive" className="flex-1 cursor-pointer">
                        Remove
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Limits;
