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

const dummyData = [
  { id: "1", name: "Netflix", amount: 9.99, currency: "USD", created_at: new Date().toISOString() },
  { id: "2", name: "Spotify", amount: 4.99, currency: "USD", created_at: new Date().toISOString() },
  { id: "3", name: "Adobe Creative Cloud", amount: 19.99, currency: "USD", created_at: new Date().toISOString() },
];

const SubscriptionsTable = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscriptions(dummyData);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) setSubscriptions(dummyData);
      else setSubscriptions(data && data.length > 0 ? data : dummyData);
      setLoading(false);
    };
    fetchSubscriptions();
  }, []);

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("subscriptions").insert([{
      user_id: user.id,
      name,
      amount: parseFloat(amount),
      currency,
      created_at: new Date().toISOString(),
    }]);
    if (error) console.error(error);
    else {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSubscriptions(data || []);
      setName(""); setAmount(""); setCurrency("");
      setDialogOpen(false);
    }
  };

  const totalAmount = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Your Subscriptions</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">+</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddSubscription}>
              <DialogHeader>
                <DialogTitle>Add New Subscription</DialogTitle>
                <DialogDescription className="text-black text-1xl">
                  Fill in the subscription details below.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 text-black mt-5">
                <div className="grid gap-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="text-black cursor-pointer">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="cursor-pointer">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b border-gray-200">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-5 w-[50px]" />
              <Skeleton className="h-5 w-[50px]" />
              <Skeleton className="h-5 w-[100px]" />
            </div>
          ))}
        </div>
      ) : (
        <Table className="border border-gray-300">
          <TableCaption>A list of your current subscriptions.</TableCaption>

          <TableHeader>
            <TableRow className="bg-black hover:bg-black">
              <TableHead className="w-[200px] text-white">Subscription</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Currency</TableHead>
              <TableHead className="text-right text-white">Created At</TableHead>
            </TableRow>
          </TableHeader>

       <TableBody>
  {subscriptions.map((sub) => (
    <TableRow key={sub.id} className="hover:bg-gray-100">
      <TableCell className="font-medium text-black">{sub.name}</TableCell>
      <TableCell className="text-black">{sub.amount.toFixed(2)}</TableCell>
      <TableCell className="text-black">{sub.currency.toUpperCase()}</TableCell>
      <TableCell className="text-black text-right">{new Date(sub.created_at).toLocaleString()}</TableCell>
    </TableRow>
  ))}
</TableBody>


          <TableFooter>
            <TableRow>
              <TableCell colSpan={1}>Total</TableCell>
              <TableCell className="text-black"><b>{totalAmount.toFixed(2)}</b></TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  );
};

export default SubscriptionsTable;
