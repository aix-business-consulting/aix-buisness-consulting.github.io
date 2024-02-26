import toast from "react-hot-toast";
import { Email, EmailData, ThreadData } from "./types";

//export const BACKEND_IP = "http://127.0.0.1:5000";
export const BACKEND_IP = "http://arcollections-env.eba-zb3ni88r.us-east-2.elasticbeanstalk.com";

export async function parseOrThrowResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errMsg = await res.json();
    console.error("error response", errMsg);
    toast.error(errMsg.message || "An error occurred");
    throw new Error(errMsg);
  }
  return res.json();
}
export async function getAllEmailData(type: string) {
  const res = await fetch(`${BACKEND_IP}/email/all?type=${type}`);
  console.log(res);
  return parseOrThrowResponse<Email[]>(res);
}

export async function getEmailDataById({ id }: { id: string }) {
  const res = await fetch(`${BACKEND_IP}/email/${id}`);
  return parseOrThrowResponse<EmailData>(res);
}

export async function postSaveDraft(postBody: { content: string; id: string }) {
  const res = await fetch(`${BACKEND_IP}/email/save-draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postBody),
  });
  return parseOrThrowResponse<string>(res);
}

export async function postDeleteDraft(id: string) {
  const res = await fetch(`${BACKEND_IP}/email/delete-draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  });
  return parseOrThrowResponse<string>(res);
}

export async function postIgnoreInvoice(id: string) {
  const res = await fetch(`${BACKEND_IP}/email/ignore-invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return parseOrThrowResponse<EmailData>(res);
}

export async function getSavedDrafts(invoice_number: number) {
  const res = await fetch(`${BACKEND_IP}/email/saved-drafts/${invoice_number}`);
  return parseOrThrowResponse<string>(res);
}

export async function postSendEmail(postBody: {
  email: string[];
  subject: string;
  body: string;
  id: string;
  conversation_id: string | null;
  template_bool: boolean;
  cc: string[];
}) {
  const res = await fetch(`${BACKEND_IP}/email/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postBody),
  });
  return parseOrThrowResponse<EmailData>(res);
}

export async function getThreadsByConversationId(conversation_id: string) {
  // pause for 300 ms before fetching
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const res = await fetch(`${BACKEND_IP}/get-threads/${conversation_id}`);
  return parseOrThrowResponse<{
    data: ThreadData[];
  }>(res);
}

export async function getThreadSummaryByConversationId(
  conversation_id: string
) {
  const res = await fetch(`${BACKEND_IP}/get-summary/${conversation_id}`);
  return parseOrThrowResponse<{
    data: string;
  }>(res);
}

export async function postRegnerateResponse(postBody: {
  conversation_id: string;
}) {
  const res = await fetch(`${BACKEND_IP}/regenerate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postBody),
  });
  return parseOrThrowResponse<{
    data: string;
  }>(res);
}
