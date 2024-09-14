import { createClient } from '@/utils/supabase/server';

const supabase = createClient();

type invite = {
  id?: string;
  group_id: string;
  inviter_id: string;
}

export default async function create_invite(req, res) {
  if (req.method === 'POST') {
    const { groupId } = req.body;
    const userId = supabase.auth.getUser();

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Insert the new invitation into the 'invitations' table, Supabase generates the UUID automatically
    const { data, error } = await supabase
      .from('invitations')
      .insert([{ group_id: groupId, inviter_id: userId }])
      .select("*")  // Retrieve the created invitation data
    //   .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return res.status(500).json({ error: 'Error creating invitation' });
    }

    // Use the UUID `id` from the newly created invitation as the token
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join-group/${data.id}`;
    res.status(200).json({ inviteLink });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
