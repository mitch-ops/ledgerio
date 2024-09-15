"use client";

import GroupDetails from "@/components/group-details";
import { notFound } from "next/navigation"; // To handle 404 errors
import { createClient } from "@/utils/supabase/client";
import { useGroups } from "@/app/GroupsContext";

type GroupProps = {
  id: string;
  name: string;
  members: number;
  amount: number;
};

type PonyUpUser = {
  name: string;
  initials: string;
  amount: number;
};

type User = {
  name: string;
  initials: string;
};

const supabase = createClient();

const ponyUpUsers: PonyUpUser[] = [
  {
    name: "Mitch Heidbrink",
    initials: "MH",
    amount: -19.78,
  },
];

// Dynamic group page component
const GroupPage = ({ params }: { params: { groupId: string } }) => {
  const { groups } = useGroups();
  const group = groups.find((g) => g.id === params.groupId);

  if (!group) {
    notFound(); // Trigger a 404 error if the group is not found
  }

  return (
    <GroupDetails
      id={group.id}
      groupName={group.name}
      balance={group.amount}
      ponyUpUser={ponyUpUsers[0]}
    />
  );
};

export default GroupPage;
