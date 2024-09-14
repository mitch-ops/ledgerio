"use client";
import { redirect, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();


export default function joining() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token'); // Get the token (UUID) from the URL
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (token) {
            // Get the currently authenticated user
            const joinGroup = async () => {
                const { data: userResponse, error } = await supabase.auth.getUser();
                const user = userResponse?.user;

                if (!user) {
                    setErrorMessage("User is not authenticated");
                    setLoading(false);
                    return;
                }

                const userId = user.id;

                // Fetch the invitation by the token (which is the invitation's UUID)
                const { data: invite, error: inviteError } = await supabase
                    .from('invitations')
                    .select('*')
                    .eq('id', token)  // Use the token to find the correct invitation
                    .single();

                if (inviteError || !invite) {
                    setErrorMessage('Invalid or expired invitation');
                    setLoading(false);
                    return;
                }

                // Insert the new user into the group membership
                const { error: membershipError } = await supabase
                    .from('group_memberships')
                    .insert([{ user_id: userId, group_id: invite.group_id, role: 'member' }]);

                if (membershipError) {
                    setErrorMessage('Failed to join group');
                    setLoading(false);
                    return;
                }

                // Redirect to the group page using the group_id
                redirect(`/groups/${invite.group_id}`);
            };

            joinGroup();
        }
    }, [token]);

    return (
        <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
        </Button>
    );
};

// function setErrorMessage(arg0: any) {
//     throw new Error("Function not implemented.");
// }
// function setLoading(arg0: boolean) {
//     throw new Error("Function not implemented.");
// }

