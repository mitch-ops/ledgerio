"use client";

import React, { useEffect, useState } from "react";
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
import { createClient } from "@/utils/supabase/client";

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
import { Loader2 } from "lucide-react";
import { useGroups } from "../GroupsContext";

type GroupProps = {
  id: string;
  name: string;
  members: number;
  amount: number;
};

// const supabase = createClient();
export default function Dashboard() {
  const { groups, isLoading } = useGroups();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Welcome, Nick</h2>
        <div className="space-y-4">
          {isLoading && (
            <div className="w-full flex justify-center">
              <Loader2 className="mr-2 h-12 w-12 animate-spin" />{" "}
            </div>
          )}
          {groups.map((group) => (
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
