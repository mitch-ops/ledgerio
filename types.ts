export type Transaction = {
  id: string;
  type: string;
  recipientID: string;
  ownerID: string;
  groupID: string;
  amount: number;
  description: string;
};
