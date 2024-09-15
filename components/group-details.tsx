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

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import { Combobox } from "./ui/combobox";
import TransactionList from "./transaction-list";
import Balance from "./balance";
import { Badge } from "./ui/badge";

const supabase = createClient();

type invite = {
  id?: string;
  group_id: string;
  inviter_id: string;
};

type GroupDetailsProps = {
  id: string;
  groupName: string;
  balance: number;
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
  ponyUpUser,
}: GroupDetailsProps) {
  // Show only the first 3 transactions

  async function getUserById(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", userId)
      .single(); // Assuming emails are unique

    if (error) {
      console.error("Error fetching user:", error.message);
      return null;
    }

    if (!data) {
      console.error("No data found for the provided uuid.");
      return null;
    }

    return data;
  }

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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [recipient, setRecipient] = useState("John Doe");
  const [amount, setAmount] = useState(0.0);
  const [desc, setDesc] = useState("Drinks last night");

  const [reqRecipient, setReqRecipient] = useState("John Doe");
  const [reqAmount, setReqAmount] = useState(0.0);
  const [reqDesc, setReqDesc] = useState("Drinks last night");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    type: string
  ) => {
    event.preventDefault(); // Prevent the default form submission behavior

    console.log("handle submit called", type);

    // Validate form inputs
    if (type === "pay") {
      console.log("pay");
      if (!recipient || amount <= 0 || !desc) {
        console.log("errororror");
        setErrorMessage("Please fill out all fields for payment.");
        return;
      }
    } else if (type === "req") {
      if (!reqRecipient || reqAmount <= 0 || !reqDesc) {
        setErrorMessage("Please fill out all fields for request.");
        console.log("errororror");
        return;
      }
    } else {
      console.error("Invalid transaction type.");
      return;
    }

    // Call the handleChargeSubmit function with the appropriate type
    await handleChargeSubmit(type);

    // Optionally reset form fields and close the dialog
    if (type === "pay") {
      setRecipient("");
      setAmount(0);
      setDesc("");
    } else if (type === "req") {
      setReqRecipient("");
      setReqAmount(0);
      setReqDesc("");
    }
  };

  // Fetch group members and transactions for the group when the page loads
  useEffect(() => {
    const fetchGroupDetails = async () => {
      setLoading(true);
      const { data: userResponse, error: userError } =
        await supabase.auth.getUser();
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

  const displayedTransactions = transactions.slice(0, 3);

  // Handle form submission for charging a user
  const handleChargeSubmit = async (type: string) => {
    setLoading(true);
    const { data: userResponse, error: userError } =
      await supabase.auth.getUser();
    const user = userResponse?.user;

    if (!user) {
      setErrorMessage("User is not authenticated");
      setLoading(false);
      return;
    }

    const paidByUserId = user.id;

    async function getUserIdFromEmail(email: string): Promise<string | null> {
      // Query the 'users' table to get the user ID associated with the email
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single(); // Assuming emails are unique

      if (error || !data) {
        console.error("Error fetching user ID:", error);
        return null;
      }

      return data.id;
    }

    const recId = await getUserIdFromEmail(reqRecipient);

    console.log(recId);

    if (type === "req") {
      // Insert the transaction (charge) into the transactions table
      const { data, error } = await supabase.from("transactions").insert([
        {
          group_id: id,
          paid_by: paidByUserId, // The current user charging someone
          owed_by: recId, // The user selected to be charged
          amount: parseFloat(reqAmount.toString()),
          description: reqDesc,
          type: "charge", // Mark it as a charge, need to change this depending on what was clicked
          status: "pending",
          created_at: new Date(),
        },
      ]);

      if (error) {
        setErrorMessage("Error charging user: " + error.message);
        setLoading(false);
        return;
      }
    } else if (type === "pay") {
      const recId = await getUserIdFromEmail(recipient);
      const { data, error } = await supabase.from("transactions").insert([
        {
          group_id: id,
          paid_by: paidByUserId, // The current user charging someone
          owed_by: recId, // The user selected to be charged
          amount: parseFloat(amount.toString()),
          description: desc,
          type: "pay", // Mark it as a charge, need to change this depending on what was clicked
          status: "pending",
          created_at: new Date(),
        },
      ]);

      if (error) {
        setErrorMessage("Error charging user: " + error.message);
        setLoading(false);
        return;
      }
    } else {
      console.error("Transaction failed");
    }

    // Clear the form and hide it
    setRecipient("");
    setReqRecipient("");

    setAmount(0);
    setReqAmount(0);

    setDesc("");
    setReqDesc("");
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
  const [refreshedTransactions, setRefreshedTransactions] =
    useState(transactions); // Store updated transactions
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
      const { data: userResponse, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userResponse?.user) {
        throw new Error("User is not authenticated");
      }

      const userId = userResponse.user.id;

      // Update the transactions where the logged-in user is "owed" by ponyUpUser
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "paid" })
        .eq("group_id", id) // Match the group
        .eq("owed_by", userId) // The current user owes the ponyUpUser
        .eq("paid_by", id) // Match the ponyUpUser who is owed
        .eq("status", "pending"); // Only update pending transactions

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
          <Balance transactions={transactions} />
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-2">Your Transactions</h2>
      <div className="space-y-2 mb-6">
        <TransactionList displayedTransactions={displayedTransactions} />
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
      </div>

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
          <Card className="bg-gray-800 border-gray-700 w-1/2">
            <CardContent className="p-4">
              <Badge variant="destructive" className="relative bottom-2 left-28">
                <p className="font-semibold">
                  ${Math.abs(ponyUpUser.amount).toFixed(2)}
                </p>
              </Badge>
              <div className="flex items-center space-x-2 flex-col">
                <Avatar className="h-12 w-12 bg-gray-600 mb-2">
                  <AvatarFallback>{ponyUpUser.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{ponyUpUser.name}</p>
                  <Button
                    size="sm"
                    className="w-full flex justify-center mt-4 rounded-full"
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

      {/* pay request form */}

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 rounded-full h-12 w-12"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <Tabs defaultValue="account" className="sm:max-w-[425px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pay">Pay</TabsTrigger>
              <TabsTrigger value="request">Request</TabsTrigger>
            </TabsList>
            <TabsContent value="pay">
              <Card>
                <CardHeader>
                  <CardTitle>Pay</CardTitle>
                  <CardDescription>
                    Pay someone money you owe them.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <form onSubmit={(e) => handleSubmit(e, "pay")}>
                    <div className="space-y-1">
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input
                        id="recipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="desc">Description</Label>
                      <Input
                        id="desc"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                      />
                    </div>
                    <CardFooter>
                      <Button type="submit">Submit</Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="request">
              <Card>
                <CardHeader>
                  <CardTitle>Request</CardTitle>
                  <CardDescription>
                    Make a request for someone to owe you money.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <form onSubmit={(e) => handleSubmit(e, "req")}>
                    <div className="space-y-1">
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input
                        id="recipient"
                        value={reqRecipient}
                        onChange={(e) => setReqRecipient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={reqAmount}
                        onChange={(e) =>
                          setReqAmount(parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="desc">Description</Label>
                      <Input
                        id="desc"
                        value={reqDesc}
                        onChange={(e) => setReqDesc(e.target.value)}
                      />
                    </div>
                    <CardFooter>
                      <Button type="submit">Save request</Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/*  */}

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
