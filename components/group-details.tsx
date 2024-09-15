"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PenSquare,
  Plus,
  ChevronRight,
  UserPlus,
  DollarSign,
  HandCoins,
} from "lucide-react";
import Link from "next/link";
import { Copy } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Separator } from "./ui/separator";

const supabase = createClient();

type invite = {
  id?: string;
  group_id: string;
  inviter_id: string;
};

export type Transaction = {
  id: number;
  user: {
    name: string;
    initials: string;
  };
  amount: number;
  description: string;
};

type GroupDetailsProps = {
  id: string;
  groupName: string;
  balance: number;
  transactions: Transaction[];
  ponyUpUser: {
    name: string;
    initials: string;
    amount: number;
  };
};

export default function GroupDetails({
  id,
  groupName,
  balance,
  transactions,
  ponyUpUser,
}: GroupDetailsProps) {
  // Show only the first 3 transactions
  const displayedTransactions = transactions.slice(0, 3);

  const [inviteLink, setInviteLink] = useState("");

  async function create_invite() {
    // Retrieve the user from Supabase auth
    const { data: userResponse, error: userError } =
      await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      return "error: Not authenticated";
    }

    const user = userResponse?.user;
    if (!user) {
      console.error("User not found");
      return "error: Not authenticated";
    }

    const userId = user.id; // Access the user ID

    // console.log(id);

    // Insert the new invitation into the 'invitations' table, Supabase generates the UUID automatically
    let inviteuuid = uuidv4();
    const { data, error } = await supabase
      .from("invitations")
      .insert([{ id: inviteuuid, group_id: id, inviter_id: userId }]);

    if (error) {
      console.error("Error creating invitation:", error);
      return "error: Error creating invitation";
    }

    // Use the UUID `id` from the newly created invitation as the token
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join-group/${inviteuuid}`;

    setInviteLink(inviteLink);
  }

  /*******************************
   * pay and reques backend here *
   * *****************************/

  // Local state to manage group members, transactions, form data, and loading states
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [transactionsState, setTransactions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Fetch group members and transactions for the group when the page loads
  useEffect(() => {
    const fetchGroupDetails = async () => {
      setLoading(true);
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      const user = userResponse?.user;

      if (!user) {
        setErrorMessage("User is not authenticated");
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Fetch group members
      const { data: members, error: membersError } = await supabase
        .from("group_memberships")
        .select("user_id")
        .eq("group_id", id);

      if (membersError || !members) {
        setErrorMessage("Error fetching group members.");
        setLoading(false);
        return;
      }

      setGroupMembers(members);

      // Fetch group transactions
      const { data: txns, error: txnsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("group_id", id);

      if (txnsError || !txns) {
        setErrorMessage("Error fetching transactions.");
        setLoading(false);
        return;
      }

      setTransactions(txns);
      setLoading(false);
    };

    fetchGroupDetails();
  }, [id]);

  // Handle form submission for charging a user
  const handleChargeSubmit = async () => {
    setLoading(true);
    const { data: userResponse, error: userError } = await supabase.auth.getUser();
    const user = userResponse?.user;

    if (!user) {
      setErrorMessage("User is not authenticated");
      setLoading(false);
      return;
    }

    const paidByUserId = user.id;

    // Insert the transaction (charge) into the transactions table
    const { data, error } = await supabase.from("transactions").insert([
      {
        group_id: id,
        paid_by: paidByUserId,  // The current user charging someone
        owed_by: selectedUser,  // The user selected to be charged
        amount: parseFloat(amount.toString()),
        description,
        type: "charge",  // Mark it as a charge, need to change this depending on what was clicked
        status: "pending",
        created_at: new Date(),
      },
    ]);

    if (error) {
      setErrorMessage("Error charging user: " + error.message);
      setLoading(false);
      return;
    }

    // Clear the form and hide it
    setSelectedUser("");
    setAmount(0);
    setDescription("");
    setFormVisible(false);
    setLoading(false);

    // Reload the transactions list
    const { data: txns, error: txnsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("group_id", id);

    if (txnsError || !txns) {
      setErrorMessage("Error fetching updated transactions.");
      setLoading(false);
      return;
    }

    setTransactions(txns);
  };

  /**********************************
   * pay/request backend ends
   **********************************/

  /**
   * pony up handle here
   */
  const [refreshedTransactions, setRefreshedTransactions] = useState(transactions); // Store updated transactions
  const [updatedPonyUpUser, setUpdatedPonyUpUser] = useState(ponyUpUser); // Track the current state of Pony Up user
  const [showPonyUp, setShowPonyUp] = useState(true); // Track the visibility of the Pony Up card
  // Function to fetch updated transactions after payment
  const fetchUpdatedTransactions = async () => {
    const { data: updatedTxns, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("group_id", id);

    if (error) {
      setErrorMessage("Error fetching updated transactions.");
      return;
    }

    // Update the state with the newly fetched transactions
    setRefreshedTransactions(updatedTxns);

    // Check if there are any remaining pending payments
    const pendingUser = updatedTxns.find(
      (txn) => txn.paid_by === id && txn.status === "pending"
    );

    // Update the Pony Up card only if there are pending transactions for the user
    if (!pendingUser) {
      //setUpdatedPonyUpUser(null); // No pending transactions, remove the Pony Up user card
    }
  };

  // Handle Pony Up (Pay button click)
  const handlePonyUp = async () => {

    try {
      // Get the authenticated user
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      if (userError || !userResponse?.user) {
        throw new Error("User is not authenticated");
      }

      const userId = userResponse.user.id;

      // Update the transactions where the logged-in user is "owed" by ponyUpUser
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "paid" })
        .eq("group_id", id)  // Match the group
        .eq("owed_by", userId)  // The current user owes the ponyUpUser
        .eq("paid_by", id)  // Match the ponyUpUser who is owed
        .eq("status", "pending");  // Only update pending transactions

      if (updateError) {
        throw new Error("Error updating transactions: " + updateError.message);
      }

      // After successful payment, refresh or hide the Pony Up card
      setLoading(false);
      alert("Transaction marked as paid!");
      setShowPonyUp(false); // Hide the card
      // Here you can refresh the page or update the UI to remove the ponyUpUser card
      await fetchUpdatedTransactions();

    } catch (error) {
      setErrorMessage((error as Error).message);
      setLoading(false);
    }
  };
  /**
   * End pony handle
   */

  return (
    <div className="bg-gray-900 text-white p-4 min-h-screen w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">{groupName}</h1>
        <Button variant="ghost" size="icon">
          <PenSquare className="h-5 w-5" />
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700 mb-6 flex justify-center">
        <CardContent className="p-4">
          <p
            className={`text-3xl font-bold ${balance < 0 ? "text-red-500" : "text-green-500"}`}
          >
            {balance < 0 ? "-" : ""}${Math.abs(balance).toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-2">Your Transactions</h2>
      <div className="space-y-2 mb-6">
        {displayedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-2 ">
              <Avatar className="h-8 w-8 bg-gray-600">
                <AvatarFallback>{transaction.user.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{transaction.user.name}</p>
                <p className="text-xs text-gray-400">
                  {transaction.description}
                </p>
              </div>
            </div>
            <p
              className={`font-semibold ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}
            >
              ${Math.abs(transaction.amount).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {transactions.length > 2 && (
        <Link href={`/group/${id}/transactions`} passHref>
          <Button
            variant="ghost"
            className="flex row items-center justify-end w-full p-0"
          >
            See All Transactions <ChevronRight size={20} />
          </Button>
        </Link>
      )}

      {/* <h2 className="text-lg font-semibold mb-2">Pony Up</h2>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-red-500">
              ${Math.abs(ponyUpUser.amount).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-12 w-12 bg-gray-600">
              <AvatarFallback>{ponyUpUser.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{ponyUpUser.name}</p>
              <Button variant="secondary" size="sm" className="mt-1" onClick={handlePonyUp}>
                Pay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {showPonyUp && ponyUpUser && (
        <>
          <h2 className="text-lg font-semibold mb-2">Pony Up</h2>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-red-500">
                  ${Math.abs(ponyUpUser.amount).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Avatar className="h-12 w-12 bg-gray-600">
                  <AvatarFallback>{ponyUpUser.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{ponyUpUser.name}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-1"
                    onClick={handlePonyUp}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Pay"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 rounded-full h-12 w-12"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <div className="w-full justify-between items-center">
            <Button variant={"ghost"}>
              <DollarSign className="h-4 w-4 mr-2" />
              Pay
            </Button>
            <Button variant={"ghost"}>
              <HandCoins className="h-4 w-4 mr-2" /> Request
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 left-4 bg-slate-700 hover:bg-slate-800 rounded-full h-12 w-12"
            onClick={create_invite}
          >
            <UserPlus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" value={inviteLink} readOnly />
            </div>
            <Button type="submit" size="sm" className="px-3">
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
