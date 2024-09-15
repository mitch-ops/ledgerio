"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

const ponyUp = async ({ groupId }) => {
    const [usersOwe, setUsersOwe] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchUsersOwe = async () => {
            setLoading(true);
            const { data: userResponse, error: userError } = await supabase.auth.getUser();
            const user = userResponse?.user;

            if (!user) {
                setErrorMessage("User is not authenticated");
                setLoading(false);
                return;
            }

            const userId = user.id;

            const { data: transactions, error: transactionsError } = await supabase
                .from("transactions")
                .select("*")
                .eq("group_id", groupId)
                .eq("paid_by", userId)
            // .eq("status", "pending")

            if (transactionsError) {
                setErrorMessage("Error fetching transactions");
                setLoading(false);
                return;
            }

            // Gotta calculate the running total for each user
            const userTotals = transactions.reduce((acc, txn) => {
                if (!acc[txn.owed_by]) {
                    acc[txn.owed_by] = { total: 0, userId: txn.owed_by };
                }
                acc[txn.owed_by].total += txn.amount;
                return acc;
            }, {});
            const usersOweArray = Object.values(userTotals);
            setUsersOwe(usersOweArray);
            setLoading(false);
        }
        fetchUsersOwe();

        // Handle "Pay" button click
        const handlePay = async (userId) => {
            setLoading(true);

            const { data: userResponse, error: userError } = await supabase.auth.getUser();
            const user = userResponse?.user;

            // Mark all transactions as paid for this user
            const { data, error } = await supabase
                .from("transactions")

            if (error) {
                setErrorMessage("Error updating transactions.");
                setLoading(false);
                return;
            }

            // Remove user tile from the UI
            setUsersOwe(usersOwe.filter((user) => user.userId !== userId));
            setLoading(false);
        };

    }, [groupId]);
}