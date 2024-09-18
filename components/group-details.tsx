"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PenSquare, Plus, ChevronRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { Copy } from "lucide-react";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";

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
import { Combobox } from "./ui/combobox";
import TransactionList from "./transaction-list";
import Balance from "./balance";
import { Badge } from "./ui/badge";
import {
  create_invite,
  fetchGroupDetails,
  handleChargeSubmit,
} from "@/app/api/actions";
import { Transaction } from "@/types";

const supabase = createClient();

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
  /* Handle Invite Creation */
  const [inviteLink, setInviteLink] = useState<string>("");

  const handleCreateInvite = async () => {
    const invite = await create_invite(id);

    if (invite) setInviteLink(invite);
    else setInviteLink("Error, try again");
  };

  /*******************************
   * pay and reques backend here *
   * *****************************/

  // Local state to manage group members, transactions, form data, and loading states
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    event.preventDefault();

    // Validate form inputs
    if (type === "pay") {
      if (!recipient || amount <= 0 || !desc) {
        console.log("Please fill out all fields for payment.");
        return;
      }
    } else if (type === "req") {
      if (!reqRecipient || reqAmount <= 0 || !reqDesc) {
        console.log("Please fill out all fields for request.");
        return;
      }
    } else {
      console.error("Invalid transaction type.");
      return;
    }

    handleNewTransaction(type);

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

  // Handle form submission for charging a user
  const handleNewTransaction = async (type: string) => {
    let currAmount = type === "pay" ? amount : reqAmount;
    let currDesc = type === "pay" ? desc : reqDesc;
    const { data: userResponse, error: userError } =
      await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      return null;
    }

    const user = userResponse?.user;
    if (!user) {
      console.error("User not found");
      return null;
    }

    const userId = user.id; // Access the user ID

    const newTransaction = {
      id: uuidv4(),
      type,
      recipientID: recipient,
      ownerID: userId,
      groupID: id,
      amount: currAmount,
      description: currDesc,
    };

    handleChargeSubmit(newTransaction);
  };

  // Fetch group members and transactions for the group when the page loads
  useEffect(() => {
    const handleFetchGroupDetails = async () => {
      const details = await fetchGroupDetails(id);
      if (details) {
        setGroupMembers(details.members);
        setTransactions(details.transactions);
      }
    };

    handleFetchGroupDetails();
  }, [id]);

  useEffect(() => {
    setDisplayedTransactions(transactions.slice(0, 3));
  }, [transactions]);

  const [displayedTransactions, setDisplayedTransactions] = useState<
    Transaction[]
  >([]);

  /**********************************
   * pay/request backend ends
   **********************************/

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
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
            onClick={handleCreateInvite}
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
