import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { InputForm } from "@/components/CreateGroup";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Welcome, Nick</h2>
        <div className="space-y-4">
          {[
            {
              id: "79e7a212-70fe-4a92-b4c2-6d15bb1acf9a",
              name: "Beach Trip '24",
              members: 4,
              amount: -20.0,
            },
            { id: "2", name: "Birthday Party", members: 12, amount: -5.33 },
            { id: "3", name: "Spring Break", members: 7, amount: 200.79 },
            { id: "4", name: "Birthday Trip '21", members: 3, amount: 21.33 },
          ].map((group) => (
            <Link href={`/groups/${group.id}`} key={group.id}>
              <Card className="bg-gray-800 border-gray-700 my-4 bg-white dark:bg-slate-800 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-gray-400">
                        {group.members} members
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>...</DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Leave</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <p
                    className={`text-lg font-semibold ${group.amount < 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {group.amount < 0 ? "-" : ""}$
                    {Math.abs(group.amount).toFixed(2)}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        <footer className="mt-6 w-full flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full max-w-xl bg-white dark:bg-blue-600 dark:text-white shadow-sm rounded-full">
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Give your group a cool name. You can change it later.
                </DialogDescription>
              </DialogHeader>
              <InputForm />
            </DialogContent>
          </Dialog>
        </footer>
      </div>
    </div>
  );
}
