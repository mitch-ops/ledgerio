"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { v4 as uuidv4 } from "uuid";
import { Transaction } from "@/types";

// const origin = headers().get("origin");

/**
 * Gets a uuid from a user given their email.
 *
 * @param email a user email
 * @returns the corresponding uuid
 */
export async function getUserIdFromEmail(
  email: string
): Promise<string | null> {
  const supabase = createClient();

  try {
    // Query the 'users' table to get the user first name associated with the email
    const { data, error } = await supabase
      .from("users")
      .select("first_name")
      .eq("email", email)
      .single(); // Assuming emails are unique

    if (error) {
      console.error("Error fetching user first name:", error.message);
      return null;
    }

    if (!data) {
      console.error("No data found for the provided email.");
      return null;
    }

    return data.first_name;
  } catch (err) {
    console.error("Unexpected error fetching user first name:", err);
    return null;
  }
}

/**
 *
 * @returns a user's first name
 */
export async function fetchUserName() {
  const supabase = createClient();
  try {
    const { data: userResponse, error: userError } =
      await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError.message);
      return null;
    }

    if (!userResponse || !userResponse.user || !userResponse.user.email) {
      console.error("No user or email found.");
      return null;
    }

    const userEmail = userResponse.user.email;
    const userName = await getUserIdFromEmail(userEmail);
    if (userName) {
      return userName;
    } else return null;
  } catch (err) {
    console.error("Unexpected error fetching user:", err);
    return null;
  }
}

/**
 * Fetch user data by uuid
 *
 * @param userId uuid of desired user
 * @returns user object
 */
export async function getUserById(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
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

export async function create_invite(id: string) {
  // Retrieve the user from Supabase auth
  const supabase = createClient();
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

  // console.log(id);

  // Insert the new invitation into the 'invitations' table, Supabase generates the UUID automatically
  let inviteuuid = uuidv4();
  const { data, error } = await supabase
    .from("invitations")
    .insert([{ id: inviteuuid, group_id: id, inviter_id: userId }]);

  if (error) {
    console.error("Error creating invitation:", error);
    return null;
  }

  // Use the UUID `id` from the newly created invitation as the token
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL!}/join-group/${inviteuuid}`;

  return inviteLink;
}

/**
 *
 * @param type
 * @param recipientEmail
 * @param id
 * @param amount
 * @param description
 * @returns
 */
export const handleChargeSubmit = async (transaction: Transaction) => {
  const supabase = createClient();
  const { data: userResponse, error: userError } =
    await supabase.auth.getUser();
  const user = userResponse?.user;

  if (!user) {
    console.log("User not authenticated");
    return null;
  }

  const paidByUserId = user.id;

  const recipientEmail = transaction.recipientID;
  const amount = transaction.amount;
  const type = transaction.type;
  const id = transaction.id;
  const description = transaction.description;

  const recId = await getUserIdFromEmail(recipientEmail);

  // request
  if (type === "req") {
    const { data, error } = await supabase.from("transactions").insert([
      {
        group_id: id,
        paid_by: paidByUserId, // The current user charging someone
        owed_by: recId, // The user selected to be charged
        amount: parseFloat(amount.toString()),
        description: description,
        type: "charge", // Mark it as a charge, need to change this depending on what was clicked
        status: "pending",
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.log("error", error);
      return null;
    }
  } else if (type === "pay") {
    const { data, error } = await supabase.from("transactions").insert([
      {
        group_id: id,
        paid_by: paidByUserId, // The current user charging someone
        owed_by: recId, // The user selected to be charged
        amount: parseFloat(amount.toString()),
        description: description,
        type: "pay", // Mark it as a charge, need to change this depending on what was clicked
        status: "pending",
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.log("error", error);
      return null;
    }
  } else {
    console.error("Transaction failed");
    return null;
  }

  return;

  // Clear the form and hide it
  //   setRecipient("");
  //   setrecipientEmail("");

  //   setAmount(0);
  //   setamount(0);

  //   setDesc("");
  //   setdescription("");
  //   setLoading(false);

  // Reload the transactions list
  //   const { data: txns, error: txnsError } = await supabase
  //     .from("transactions")
  //     .select("*")
  //     .eq("group_id", id);

  //   if (txnsError || !txns) {
  //     setErrorMessage("Error fetching updated transactions.");
  //     setLoading(false);
  //     return;
  //   }

  //   setTransactions(txns);
};

export const fetchGroupDetails = async (id: string) => {
  const supabase = createClient();
  const { data: userResponse, error: userError } =
    await supabase.auth.getUser();
  const user = userResponse?.user;

  if (!user) {
    console.log("User is not authenticated");
    return null;
  }

  const userId = user.id;

  // Fetch group members
  const { data: members, error: membersError } = await supabase
    .from("group_memberships")
    .select("user_id")
    .eq("group_id", id);

  if (membersError || !members) {
    console.log("Error fetching group members.");
    return null;
  }

  // Fetch group transactions
  const { data: txns, error: txnsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("group_id", id);

  if (txnsError || !txns) {
    console.log("Error fetching transactions.");
    return null;
  }

  const groupDetails = {
    members: [members],
    transactions: [txns],
  };

  return groupDetails;
};
