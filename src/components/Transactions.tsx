import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [description, setDescription] = useState("");

  const dummyData = [
    { id: "1", bank_id: "67a54a88-eaa9-4dee-b630-cfe504416787", amount: 50, type: "deposit", description: "Grocery" },
    { id: "2", bank_id: "67a54a88-eaa9-4dee-b630-cfe504416787", amount: 200, type: "withdrawal", description: "Salary" },
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTransactions(dummyData);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        setTransactions(dummyData);
      } else if (data.length === 0) {
        // Insert dummy data for first-time users
        const transaction = dummyData.map(d => ({ ...d, user_id: user.id, created_at: new Date().toISOString() }));
        console.log(transaction)
        await supabase.from("transactions").insert(transaction);
        setTransactions(dummyData.map(d => ({ ...d, user_id: user.id })));
      } else {
        setTransactions(data);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        amount: parseFloat(amount),
        type,
        description,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) console.error("Error adding transaction:", error);
    else {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setTransactions(data || []);
      setAmount(""); setType("Expense"); setDescription(""); setDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Transactions</h2>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>+</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddTransaction}>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription className="text-black">
                  Fill in the details below.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 mt-5 text-black">
                <div className="grid gap-1">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" required />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="type">Type</Label>
                  <Select onValueChange={setType} value={type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Expense">Expense</SelectItem>
                      <SelectItem value="Income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="text-black">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex justify-between p-2 border-b border-gray-200">
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[50px]" />
            <Skeleton className="h-5 w-[50px]" />
            <Skeleton className="h-5 w-[100px]" />
          </div>
        ))
      ) : (
        <Table className="border border-gray-300">
          <TableCaption>Your transactions</TableCaption>
          <TableHeader>
            <TableRow className="bg-black hover:bg-black">
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Description</TableHead>
              <TableHead className="text-white text-right">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(t => (
              <TableRow key={t.id} className="hover:bg-gray-100 text-black">
                <TableCell className="font-medium ">{t.amount}</TableCell>
                <TableCell>
                  <Badge variant={t.type === "Expense" ? "destructive" : "success"}>{t.type}</Badge>
                </TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className="text-right">{new Date(t.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Transactions;
