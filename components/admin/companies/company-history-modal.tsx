import React from "react";
import { Modal, Form, Input, Select, Button, Timeline } from "antd";
import { Clock, MessageSquare } from "lucide-react";
import dayjs from "dayjs";
import { useList } from "@/hooks/api/useList";
import { useMutationApi } from "@/hooks/api/useMutationApi";

interface CompanyHistoryModalProps {
  open: boolean;
  onCancel: () => void;
  company: any;
}

export function CompanyHistoryModal({ open, onCancel, company }: CompanyHistoryModalProps) {
  const [noteForm] = Form.useForm();

  const { data: historyRes, refetch: refetchHistory, isFetching: isLoadingHistory } = useList<any>(
    `history-${company?.id}`,
    `/api/admin/companies/${company?.id}/history`,
    {},
    {
      enabled: !!company?.id
    }
  );

  const historyData = historyRes?.data?.history || [];

  const addNoteMutation = useMutationApi<any>(`/api/admin/companies/${company?.id}/history`, {
    onSuccess: () => {
      noteForm.resetFields();
      refetchHistory();
    }
  });

  const handleAddNote = (values: any) => {
    if (!company) return;
    addNoteMutation.mutate(values);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 border-b pb-3 mb-4">
          <Clock className="w-5 h-5 text-slate-500" />
          Communication History - {company?.name || "Company"}
        </div>
      }
      open={open}
      onCancel={() => {
        onCancel();
        noteForm.resetFields();
      }}
      footer={null}
      width={700}
      destroyOnHidden
    >
      <div className="max-h-[400px] overflow-y-auto pr-2 mb-4 pb-4">
        {isLoadingHistory ? (
          <div className="text-center py-8 text-slate-500">Loading history...</div>
        ) : historyData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No communication history yet.</div>
        ) : (
          <Timeline
            className="mt-4"
            items={historyData.map((item: any) => {
              const dateStr = dayjs(item.createdAt).format("MMM DD, YYYY - hh:mm A");
              if (item.type === 'manual_note') {
                return {
                  color: "blue",
                  content: (
                    <div className="pb-6 pt-0.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm text-slate-800">Manual Note</span>
                        {item.status && (
                          <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-700 rounded-full">
                            {item.status}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium ml-auto">{dateStr}</span>
                      </div>
                      <div className="text-sm text-slate-700 bg-blue-50/50 p-3.5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                        {item.note}
                      </div>
                    </div>
                  )
                };
              } else {
                // Campaign
                const campaign = item.campaign_id;
                const formattedBody = campaign?.body || "";

                return {
                  color: "#6366f1",
                  content: (
                    <div className="pb-6 pt-0.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm text-slate-800">Email Campaign</span>
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-indigo-100 text-indigo-700">
                          Sent
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium ml-auto">{dateStr}</span>
                      </div>
                      <div className="text-sm p-4 rounded-lg shadow-sm border-l-4 bg-indigo-50/50 border-indigo-500">
                        {campaign?.subject && (
                          <div className="font-semibold text-indigo-900 mb-2 pb-2 border-b border-indigo-100/50">
                            Subject: {campaign.subject}
                          </div>
                        )}
                        <div 
                          className="leading-relaxed text-indigo-900 overflow-hidden text-ellipsis max-h-[150px]"
                          dangerouslySetInnerHTML={{__html: formattedBody}} 
                        />
                      </div>
                    </div>
                  )
                };
              }
            })}
          />
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <div className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          Add Communication Note
        </div>
        <Form form={noteForm} layout="vertical" onFinish={handleAddNote} className="mb-0">
          <div className="flex gap-3">
            <div className="flex-1">
              <Form.Item name="note" className="mb-0" rules={[{ required: true, message: 'Please enter a note' }]}>
                <Input.TextArea 
                  placeholder="Type your note here... (e.g., Followed up on payment)" 
                  rows={2} 
                  className="resize-none"
                />
              </Form.Item>
            </div>
            <div className="w-[200px] flex flex-col gap-2 justify-end">
              <Form.Item name="status" className="mb-0">
                <Select placeholder="Select Status" options={[
                  { value: "Note", label: "Note" },
                  { value: "Emailed - Awaiting Response", label: "Emailed - Awaiting Response" },
                  { value: "Payment Follow-up", label: "Payment Follow-up" },
                  { value: "Subscription Renewed", label: "Subscription Renewed" },
                  { value: "Subscription Canceled", label: "Subscription Canceled" },
                  { value: "Hot", label: "Hot" },
                  { value: "Less Interest", label: "Less Interest" },
                  { value: "Own (using our system)", label: "Own (using our system)" },
                ]} />
              </Form.Item>
              <Button
                htmlType="submit"
                disabled={addNoteMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white"
              >
                {addNoteMutation.isPending ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
