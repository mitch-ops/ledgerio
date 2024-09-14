import React from "react";
import { Button } from "@/components/ui/button";
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

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Welcome, Nick</h2>
        <div className="space-y-4">
          {[
            { id: 1, name: "Beach Trip '24", members: 4, amount: -20.0 },
            { id: 2, name: "Birthday Party", members: 12, amount: -5.33 },
            { id: 3, name: "Spring Break", members: 7, amount: 200.79 },
            { id: 4, name: "Birthday Trip '21", members: 3, amount: 21.33 },
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
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white max-w-xl">
            Create Group
          </Button>
        </footer>
      </div>
    </div>
  );
}
