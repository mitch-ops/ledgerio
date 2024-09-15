import { useEffect, useState } from "react";
import { Transaction } from "./transaction-list";
import { Loader2 } from "lucide-react";

type BalanceProps = {
  transactions: Transaction[];
};

export default function Balance({ transactions }: BalanceProps) {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0.0);

  useEffect(() => {
    let newBalance = 0.0;

    transactions.forEach((txn) => {
      const amount = txn.amount;
      if (txn.type === "pay") {
        newBalance -= amount;
      } else {
        newBalance += amount;
      }
    });

    setBalance(newBalance);
    setLoading(false); // Optionally set loading to false once balance is computed
  }, [transactions]); // Run effect when transactions change

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <p
        className={`text-3xl font-bold ${balance < 0 ? "text-red-500" : "text-green-500"}`}
      >
        {loading && <Loader2 className="animate" />}
        {!loading && (
          <>
            {balance < 0 ? "-" : ""}${Math.abs(balance).toFixed(2)}
          </>
        )}
      </p>
    </>
  );
}
