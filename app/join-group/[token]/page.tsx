"use client";

import { notFound } from "next/navigation"; // To handle 404 errors
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const supabase = createClient();

const JoinGroupPage = ({ params }: { params: { token: string } }) => {
  const token = params.token; // Get the invite ID (UUID) from the URL
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Successfully joined group!"
  );
  const [groupId, setGroupId] = useState("");

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

        setGroupId(invite.group_id);

        // Check if the user is already a member of the group before inserting
        const { data: existingMembership, error: existingMembershipError } =
          await supabase
            .from("group_memberships")
            .select("*")
            .eq("user_id", userId)
            .eq("group_id", invite.group_id)
            .single();

        if (existingMembership) {
          setErrorMessage("User is already a member of this group");
          setLoading(false);
          return;
        }

        // If no existing membership, insert the new membership
        const { data: insertMembershipData, error: membershipError } =
          await supabase
            .from("group_memberships")
            .insert([
              { user_id: userId, group_id: invite.group_id, role: "member" },
            ]);

        if (membershipError) {
          setErrorMessage("Failed to join group");
          setLoading(false);
          return;
        }

        setLoading(false);

        //
      }
    };

    joinGroup();
  }, [token]); // Watch for changes in the token

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="w-full flex justify-center items-center">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Please wait" : errorMessage}
        </div>

        {!loading && (
          <Link href={`/groups/${groupId}`}>
            <Button>Go to Group</Button>
          </Link>
        )}
      </div>
    </>
  );
};

export default JoinGroupPage;
