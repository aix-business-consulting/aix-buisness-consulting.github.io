/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getAllEmailData,
  getEmailDataById,
  getThreadSummaryByConversationId,
  getThreadsByConversationId,
  postDeleteDraft,
  postIgnoreInvoice,
  postRegnerateResponse,
  postSaveDraft,
  postSendEmail,
} from "@/lib/api";
import useEmail from "../hooks/useEmail";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import toast from "react-hot-toast";
import { useDebounceValue } from "usehooks-ts";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import { Input } from "@/components/ui/input";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function HomePage() {
  const { selectedEmail } = useEmail();
  const { data: email, refetch } = useQuery(
    ["email", selectedEmail?.id],
    () => getEmailDataById({ id: selectedEmail!.id }),
    {
      enabled: !!selectedEmail && !!selectedEmail.id && false,
      refetchOnWindowFocus: false,
      keepPreviousData: false,
      retryDelay: 1000,
      retry: 2,
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );
  return (
    <div className="flex flex-row gap-x-4 h-full m-4 flex-grow">
      <ResizablePanelGroup direction="horizontal">
        <LeftPanel refetch={refetch} />
        <ResizableHandle className="m-1.5 opacity-20" />
        <MiddlePanel email={email} refetch={refetch} />
        <ResizableHandle className="m-1.5 opacity-20" />
        <RightPanel />
      </ResizablePanelGroup>
    </div>
  );
}
import imgUrl from "../public/logo.png";
import { EmailData } from "@/lib/types";

const types = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "template",
    label: "Template",
  },
  {
    value: "reply",
    label: "Reply",
  },
];

function LeftPanel({ refetch }: { refetch: () => void }) {
  const [type, setType] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const { data: emailList, isLoading } = useQuery(
    ["all-email", type],
    () => getAllEmailData(type),
    {
      refetchOnWindowFocus: false,
      enabled: !!type && type !== "",
      keepPreviousData: false,
    }
  );
  const { setSelectedEmail, selectedEmail } = useEmail();
  useEffect(() => {
    if (emailList && emailList.length > 0) {
      setSelectedEmail(emailList[0]);
      // call refetch in 0.5 second
      setTimeout(() => {
        refetch();
      }, 200);
    }
  }, [emailList, setSelectedEmail, refetch]);

  useEffect(() => {
    // call refetch in 0.5 second after selectedEmail changes
    // this is needed because psycopg2 crashes whenever db query call too fast after another
    setTimeout(() => {
      refetch();
    }, 200);
  }, [refetch, selectedEmail]);
  return (
    <ResizablePanel defaultSize={25} className="h-full ">
      <div className="min-h-[93vh] max-h-[93vh] flex flex-col">
        <img src={imgUrl} alt="logo" className="pb-2 w-[200px]" />
        <div className="py-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {type
                  ? types.find((t) => t.value === type)?.label
                  : "Select type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search type..." />
                <CommandEmpty>No type found.</CommandEmpty>
                <CommandGroup>
                  {types.map((t) => (
                    <CommandItem
                      key={t.value}
                      value={t.value}
                      onSelect={(currentValue) => {
                        setType(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          type === t.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {t.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="border rounded divide-y flex flex-grow flex-col overflow-scroll">
          {isLoading ? (
            <div className="flex grow justify-center items-center h-full">
              <p className="font-semibold">Loading...</p>
            </div>
          ) : emailList && emailList.length > 0 ? (
            emailList
              .filter((email) => {
                // filter the ones with title starting with Message from
                return !email.subject.startsWith("Message from");
              })
              .map((email) => {
                return (
                  <div
                    onClick={() => {
                      setSelectedEmail(email);
                    }}
                    key={email.id}
                    className={`p-2 flex flex-row items-center gap-x-2 hover:bg-gray-100 cursor-pointer ${
                      email.ignore_bool ? "opacity-50" : ""
                    } ${email === selectedEmail ? "bg-gray-200" : ""}`}
                  >
                    <p className="text-base">{email.subject}</p>
                    {email.sent_bool && (
                      <p className="text-xs text-green-500">Sent</p>
                    )}
                    {email.ignore_bool && (
                      <p className="text-xs text-orange-500">Ignored</p>
                    )}
                  </div>
                );
              })
          ) : emailList && emailList.length == 0 ? (
            <div className="flex grow justify-center items-center h-full">
              <p className="font-semibold text-center">No email</p>
            </div>
          ) : (
            <div className="flex grow justify-center items-center h-full">
              <p className="font-semibold text-center">
                Something went wrong while loading emails. Please refresh the
                page
              </p>
            </div>
          )}
        </div>
      </div>
      <a href="/upload" className="pt-2 text-center underline">
        {" "}
        Upload Excel
      </a>
    </ResizablePanel>
  );
}

const editorOptions = {
  buttonList: [
    ["undo", "redo"],
    ["removeFormat"],
    ["bold", "underline", "italic", "fontSize"],
    ["fontColor", "hiliteColor"],
    ["align", "horizontalRule", "list"],
    ["table", "link"],
  ],
};

function MiddlePanel({
  email,
  refetch,
}: {
  email: EmailData | undefined;
  refetch: () => void;
}) {
  const { selectedEmail } = useEmail();
  console.log(selectedEmail);

  // auto save in 500 miliseconds after user stops typing
  const [contentChanged, setContentChanged] = useDebounceValue(false, 500);
  const [value, setValue] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    setValue(email?.response ?? "");
    setSubject(selectedEmail?.subject ?? "");
  }, [email, setSubject, selectedEmail]);

  const onChangeHandler = (content: string) => {
    console.log(content);
    setValue(content);
  };

  const sendEmailMutation = useMutation({
    mutationFn: postSendEmail,
    onMutate: () => {
      toast.loading("Sending...", {
        id: "send-email",
        position: "top-center",
      });
    },
    onSuccess: () => {
      toast.success("Sent", {
        id: "send-email",
      });
      // revalidate the email list
      queryClient.invalidateQueries("all-email");
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "send-email",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: postSaveDraft,
    onMutate: () => {
      toast.loading("Saving...", {
        id: "save-draft",
        position: "top-center",
      });
    },
    onSuccess: () => {
      toast.success("Saved", {
        id: "save-draft",
      });
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "save-draft",
      });
    },
  });

  const queryClient = useQueryClient();
  const ignoreMutation = useMutation({
    mutationFn: postIgnoreInvoice,
    onSuccess: () => {
      toast.success("Operation success", {
        id: "ignore-draft",
      });
      // revalidate the email list
      queryClient.invalidateQueries("all-email");
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "ignore-draft",
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: postRegnerateResponse,
    onMutate: () => {
      toast.loading("Regenerating...", {
        id: "regenerate-draft",
        position: "top-center",
      });
    },
    onSuccess: () => {
      toast.success("Regenerated successfully", {
        id: "regenerate-draft",
      });
      // revalidate the email list
      // queryClient.invalidateQueries("all-email");
      // queryClient.invalidateQueries(["email", selectedEmail?.id]);
      refetch();

      // console.log(res);
      // setValue(res.data);
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "regenerate-draft",
      });
    },
  });

  const deleteDraftMutation = useMutation({
    mutationFn: postDeleteDraft,
    onMutate: () => {
      toast.loading("Regenerating...", {
        id: "delete-draft",
        position: "top-center",
      });
    },
    onSuccess: () => {
      toast.success("Regenerated", {
        id: "delete-draft",
      });
      // revalidate the email list
      // queryClient.invalidateQueries(["email", selectedEmail?.id]);
      refetch();
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "delete-draft",
      });
    },
  });

  useEffect(() => {
    if (contentChanged) {
      const timeout = setTimeout(() => {
        if (!selectedEmail) return;
        saveMutation.mutate({
          id: selectedEmail.id,
          content: value,
        });
        setContentChanged(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [contentChanged, saveMutation, selectedEmail, value, setContentChanged]);

  const [ccRecipients, setCCRecipients] = useState<string[]>();
  const [inputCCEmail, setInputCCEmail] = useState<string>("");

  return (
    <ResizablePanel
      defaultSize={50}
      className="h-full flex-1 flex flex-col border border-gray-200 rounded-md "
    >
      <div className="min-h-[93vh] max-h-[93vh] overflow-clip p-3 flex flex-col flex-grow">
        <div className="flex flex-col justify-between min-h-[50px]">
          {selectedEmail && (
            <>
              <p className="font-bold line-clamp-1">{selectedEmail.subject}</p>
              {selectedEmail.template_bool && (
                <div className="flex flex-row">
                  <p className="text-sm line-clamp-1">
                    <span className="font-semibold">Client Name:</span>
                    {selectedEmail.client_name ?? "N/A"}
                  </p>
                  <p className="text-sm line-clamp-1 pl-2">
                    <span className="font-semibold"> Project Name:</span>
                    {selectedEmail.project_name ?? "N/A"}
                  </p>
                </div>
              )}
              {/* {selectedEmail.to_recipients && (
                <p className="border p-1">
                  <span className="font-semibold">to recipients:</span>{" "}
                  {selectedEmail.to_recipients.join(", ")}
                </p>
              )} */}
              {selectedEmail.clent_emails && (
                <p className="border-b border-x p-1">
                  <span className="font-semibold">Send To:</span>{" "}
                  {selectedEmail.clent_emails.join(", ")}
                </p>
              )}
              <div className="p-1 border-x border-b">
                {ccRecipients && (
                  <div>
                    <span className="font-semibold">CC:</span>{" "}
                    {ccRecipients.join(", ")}
                  </div>
                )}

                <div className="flex flex-row gap-x-1">
                  <Input
                    className="max-h-[30px]"
                    value={inputCCEmail}
                    onChange={(e) => {
                      setInputCCEmail(e.target.value);
                    }}
                    placeholder="Add CC recipients"
                  />
                  <Button
                    className="max-h-[30px]"
                    onClick={() => {
                      setCCRecipients((prev) => [
                        ...(prev ?? []),
                        inputCCEmail,
                      ]);
                      setInputCCEmail("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col flex-grow">
          <div className="mb-2.5 flex flex-row items-center mt-4 gap-x-2">
            <h2 className="font-semibold">Subject</h2>
            <Input
              className="max-h-[30px]"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
              }}
            />
          </div>
          {/* <div className="flex flex-grow "> */}
          <SunEditor
            setContents={email?.response ?? ""}
            setOptions={editorOptions}
            onChange={onChangeHandler}
            onInput={() => setContentChanged(true)}
            // className="flex flex-grow w-full h-full"
            height="50vh"
          />
          {/* </div> */}
          <div className="flex flex-row gap-x-2 p-2">
            <Button
              onClick={() => {
                if (value.length === 0 || !subject || !selectedEmail) {
                  toast.error("No email to send");
                  return;
                }
                sendEmailMutation.mutate({
                  email: selectedEmail.clent_emails,
                  subject: subject,
                  body: value,
                  id: selectedEmail.id,
                  conversation_id: selectedEmail.conversation_id,
                  template_bool: selectedEmail.template_bool,
                  cc: ccRecipients ?? [],
                });
              }}
            >
              Send
            </Button>
            <Button
              onClick={() => {
                if (selectedEmail?.conversation_id) {
                  // if it's a thread, regenerate the response
                  regenerateMutation.mutate({
                    conversation_id: selectedEmail.conversation_id,
                  });
                } else {
                  // if it's not a thread, delete the draft
                  deleteDraftMutation.mutate(selectedEmail!.id);
                }
              }}
            >
              Regenerate
            </Button>
            <Button
              onClick={() => {
                if (!selectedEmail?.id) {
                  toast.error("No email to save");
                  return;
                }
                saveMutation.mutate({
                  id: selectedEmail.id,
                  content: value,
                });
              }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                if (!selectedEmail?.id) {
                  toast.error("No email to ignore");
                  return;
                }
                ignoreMutation.mutate(selectedEmail.id);
              }}
            >
              {selectedEmail?.ignore_bool ? "Unignore" : "Ignore"}
            </Button>
          </div>
        </div>
      </div>
    </ResizablePanel>
  );
}

function RightPanel() {
  const { selectedEmail } = useEmail();

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery(
    ["summary", selectedEmail?.conversation_id],
    () => getThreadSummaryByConversationId(selectedEmail!.conversation_id!),
    {
      enabled: !!selectedEmail && !!selectedEmail.conversation_id,
      refetchOnWindowFocus: false,
      refetchInterval: 1000000, // set to a large number to prevent auto refetch
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      retry: false,

      // keepPreviousData: true,
    }
  );
  const { data: threadData } = useQuery(
    ["thread", selectedEmail?.conversation_id],
    () => getThreadsByConversationId(selectedEmail!.conversation_id!),
    {
      enabled: !!selectedEmail && !!selectedEmail.conversation_id,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
  console.log(threadData);

  return (
    <ResizablePanel
      defaultSize={25}
      className="h-full flex min-h-[93vh] border border-gray-200 rounded-md p-3 flex-col min-w-"
    >
      {/* <ResizablePanelGroup direction="vertical" className="min-h-[91vh]"> */}
      {/* {selectedEmail?.conversation_id && ( */}
      <div
        className="overflow-scroll flex-grow border p-1 rounded max-h-[50vh]"
        // defaultSize={50}
      >
        <p className="font-bold">Email Thread</p>
        {selectedEmail?.conversation_id ? (
          threadData && threadData.data.length > 0 ? (
            threadData.data.map((thread) => {
              return (
                <div
                  key={thread.sent_date_time}
                  className="p-2 flex flex-col gap-y-2 overflow-scroll"
                >
                  <div dangerouslySetInnerHTML={{ __html: thread.prompt }} />
                </div>
              );
            })
          ) : threadData && threadData.data.length == 0 ? (
            <p className="p-2">Thread has no previous emails</p>
          ) : (
            <p className="p-2">Loading...</p>
          )
        ) : (
          <p className="p-2">Not a thread</p>
        )}
      </div>
      {/* )} */}
      {/* <ResizableHandle className="m-1.5 opacity-20" /> */}
      <div className="overflow-scroll flex-grow  border p-1 rounded">
        <p className="font-bold">Email Summary</p>
        <div className="p-2">
          {!selectedEmail?.conversation_id && "Not a thread"}
          {isLoadingSummary && "Loading..."}
          <div dangerouslySetInnerHTML={{ __html: summaryData?.data ?? "" }} />
        </div>
      </div>
      {/* </div> */}
    </ResizablePanel>
  );
}
