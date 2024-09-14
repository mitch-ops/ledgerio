// import { createClient } from '@/utils/supabase/server';

// const supabase = createClient();

// type group = {
//     name: string;
//     created_by: string;
// }

// const joinGroup = async (token: string) => {
//     // Get the currently authenticated user
//     const { data: userResponse, error } = 
//         await supabase.auth.getUser();

//     const user = userResponse?.user;

//     if (!user) {
//         throw new Error("User is not authenticated");
//     }

//     const userId = user.id;

//     // Fetch the invitation by the token (which is the invitation's UUID)
//     const { data: invite, error: inviteError } = await supabase
//         .from('invitations')
//         .select('*')
//         .eq('id', token)  // Use the token to find the correct invitation
//         .single();

//     if (inviteError) {
//         console.error('Error fetching invitation:', inviteError);
//         throw new Error('Invalid or expired invitation');
//     }

//     // Insert the new user into the group membership
//     const { data: membership, error: membershipError } = await supabase
//         .from('group_memberships')
//         .insert([{ user_id: userId, group_id: invite.group_id, role: 'member' }]);

//     if (membershipError) {
//         console.error('Error adding user to group:', membershipError);
//         throw new Error('Failed to join group');
//     }

//     console.log('User added to group successfully:', membership);
//     return invite.group_id;
// };