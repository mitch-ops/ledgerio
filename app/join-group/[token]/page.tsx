"use client";

import { notFound, redirect } from "next/navigation"; // To handle 404 errors
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const JoinGroupPage = ({ params }: { params: { token: string } }) => {
  const token = params.token; // Get the invite ID (UUID) from the URL
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const joinGroup = async () => {
      if (token) {
        // Fetch the currently authenticated user
        const { data: userResponse, error } = await supabase.auth.getUser();
        const user = userResponse?.user;

        if (!user) {
          setErrorMessage("User is not authenticated");
          setLoading(false);
          return;
        }

        const userId = user.id;

        // Fetch the invitation by the token (invite ID)
        const { data: invite, error: inviteError } = await supabase
          .from("invitations")
          .select("*")
          .eq("id", token) // Find the invite by UUID
          .single();

        if (inviteError || !invite) {
          setErrorMessage("Invalid or expired invitation");
          setLoading(false);
          notFound(); // If the invite doesn't exist or is expired, show a 404 page
          return;
        }

        // Add the user to the group membership
        const { error: membershipError } = await supabase
          .from("group_memberships")
          .insert([
            { user_id: userId, group_id: invite.group_id, role: "member" },
          ]);

        if (membershipError) {
          setErrorMessage("Failed to join group");
          setLoading(false);
          return;
        }

        // Redirect to the group page after successfully joining
        redirect(`/groups/${invite.group_id}`);
      }
    };

    joinGroup();
  }, [token]); // Watch for changes in the token

  return (
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {loading ? "Please wait" : errorMessage}
    </Button>
  );
};

export default JoinGroupPage;
