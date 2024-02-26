export type Email = {
  id: string;
  subject: string;
  client_name: string | null;
  // invoice_number: string | null;
  project_name: string | null;
  clent_emails: string[];
  to_recipients: string[];
  conversation_id: string | null;
  sent_bool: boolean;
  ignore_bool: boolean;
  template_bool: boolean;
};

export type EmailData = {
  response: string;
};

export type ThreadData = {
  client_emails: string[];
  conversation_id: string;
  conversation_id_2: string;
  ignore_bool: boolean;
  prompt: string;
  response: string;
  sent_bool: boolean;
  sent_date_time: string;
  subject: string;
  template_bool: boolean;
  to_recipients: string[];
};

// interface EmailDataContainer {
//   data: EmailData[];
// }
