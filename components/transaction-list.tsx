import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Transaction } from "@/types";
import { getUserIdFromEmail } from "@/app/api/actions";

type TransactionListProps = {
  displayedTransactions: Transaction[];
};

type UserDetails = {
  first_name: string;
  last_name: string;
  // Add other fields if necessary
};

type UserDetailsMap = {
  [userId: string]: UserDetails | null;
};

const TransactionList = ({ displayedTransactions }: TransactionListProps) => {
  const [userDetailsMap, setUserDetailsMap] = useState<UserDetailsMap>({});

  const supabase = createClient();

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

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetailsPromises = displayedTransactions.map(
        async (transaction) => {
          const userID = await getUserIdFromEmail(transaction.recipientID);
          let userDetails;
          if (userID) userDetails = await getUserById(userID);
          return { userId: userID, userDetails: userDetails || null }; // Ensure userDetails is null if undefined
        }
      );

      const userDetailsArray = await Promise.all(userDetailsPromises);

      // Transform the array into a map for easier access
      const userDetailsMap: UserDetailsMap = userDetailsArray.reduce(
        (acc: UserDetailsMap, { userId, userDetails }) => {
          if (userId) acc[userId] = userDetails;
          return acc;
        },
        {} as UserDetailsMap
      );

      setUserDetailsMap(userDetailsMap);
    };

    fetchUserDetails();
  }, [displayedTransactions]);

  return (
    <div>
      {displayedTransactions.map((transaction) => {
        const userDetails = userDetailsMap[transaction.recipientID];

        return (
          <div>
            {displayedTransactions.map((transaction) => {
              const userDetails = userDetailsMap[transaction.recipientID];

              return (
                <div
                  key={transaction.id} // Ensure transaction.id is unique
                  className="flex items-center justify-between bg-gray-800 p-3 rounded-lg m-2"
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 bg-gray-600">
                      <AvatarFallback key={transaction.recipientID}>
                        {" "}
                        {/* Ensure unique key here */}
                        {userDetails &&
                          `${userDetails.first_name.slice(0, 1)}${userDetails.last_name.slice(0, 1)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {userDetails ? (
                        <>
                          <p className="font-medium">
                            {userDetails.first_name} {userDetails.last_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {transaction.description}
                          </p>
                        </>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${transaction.type === "pay" ? "text-red-500" : "text-green-500"}`}
                  >
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
