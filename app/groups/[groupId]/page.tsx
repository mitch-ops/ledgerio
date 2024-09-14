import GroupDetails, { Transaction } from "@/components/group-details";
import { notFound } from "next/navigation"; // To handle 404 errors

type GroupProps = {
  id: number;
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

const groups: GroupProps[] = [
  { id: 1, name: "Beach Trip '24", members: 4, amount: -20.0 },
  { id: 2, name: "Birthday Party", members: 12, amount: -5.33 },
  { id: 3, name: "Spring Break", members: 7, amount: 200.79 },
  { id: 4, name: "Birthday Trip '21", members: 3, amount: 21.33 },
];

const transactions: Transaction[] = [
  {
    id: 1,
    user: { name: "Mitch Heidbrink", initials: "MH" },
    amount: -5.0,
    description: "Drink from Sharky's",
  },
  {
    id: 2,
    user: { name: "John Doe", initials: "JD" },
    amount: 5.0,
    description: "Gas",
  },
  {
    id: 3,
    user: { name: "Mitch Heidbrink", initials: "MH" },
    amount: -14.78,
    description: "Drink from Sharky's",
  },
];

const ponyUpUsers: PonyUpUser[] = [
  {
    name: "Mitch Heidbrink",
    initials: "MH",
    amount: -19.78,
  },
];

// Dynamic group page component
const GroupPage = ({ params }: { params: { groupId: string } }) => {
  const group = groups.find((g) => g.id === Number(params.groupId));

  if (!group) {
    notFound(); // Trigger a 404 error if the group is not found
  }

  return (
    <GroupDetails
      id={group.id}
      groupName={group.name}
      balance={group.amount}
      transactions={transactions}
      ponyUpUser={ponyUpUsers[0]}
    />
  );
};

export default GroupPage;
