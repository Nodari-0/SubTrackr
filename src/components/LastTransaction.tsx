import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge"; // ✅ FIX: Added import
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  category: string;
  created_at: string;
}

function lastTransaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }); // ✅ Show recent first

      if (!error && data) {
        setTransactions(data);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <Table className="border border-gray-300">
          <TableCaption>Your transactions</TableCaption>
          <TableHeader>
            <TableRow className="bg-black hover:bg-black">
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Description</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white text-right">
                Created At
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.slice(0, 5).map((t) => (
              <TableRow key={t.id} className="hover:bg-gray-100 text-black">
                <TableCell className="font-medium">{t.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={t.type === "Expense" ? "destructive" : "success"}
                  >
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{t.category || "N/A"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {new Date(t.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default lastTransaction;
