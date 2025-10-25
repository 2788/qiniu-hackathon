export class KbTicketDto {
  id: number;
  title: string;
  description: string;
  category: string;
  replies: KbReplyDto[];
}

export class KbReplyDto {
  content: string;
  owner: 'customer' | 'agent';
}
