import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PenSquare, Plus, ChevronRight} from "lucide-react";
import Link from "next/link";
import { Copy } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  id: number;
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
            <div className="flex items-center space-x-2">
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
              <Button variant="secondary" size="sm" className="mt-1">
                Pay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 rounded-full h-12 w-12"
      >
        <Plus className="h-6 w-6" />
      </Button>
        
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite</Button>
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
            <Input
              id="link"
              defaultValue="https://ui.shadcn.com/docs/installation"
              readOnly
            />
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
