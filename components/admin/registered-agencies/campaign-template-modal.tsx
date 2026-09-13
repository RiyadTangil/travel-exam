"use client";

import React from "react";
import { Modal, Input, Select } from "antd";
import { MessageSquare } from "lucide-react";

interface CampaignTemplateModalProps {
  open: boolean;
  onCancel: () => void;
  messageSubject: string;
  setMessageSubject: (val: string) => void;
  messageBody: string;
  setMessageBody: React.Dispatch<React.SetStateAction<string>>;
  campaignsList: any[];
}

export function CampaignTemplateModal({
  open,
  onCancel,
  messageSubject,
  setMessageSubject,
  messageBody,
  setMessageBody,
  campaignsList,
}: CampaignTemplateModalProps) {
  const insertVariable = (variable: string) => {
    setMessageBody((prev) => prev + variable);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-indigo-700">
          <MessageSquare className="w-5 h-5" />
          <span>Campaign Message Template</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="mt-4 space-y-4">
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-sm text-indigo-800 mb-4">
          <p>Draft a message here to enable clickable emails/phones in the table and bulk sending features.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Load Template from Previous Campaign
          </label>
          <Select
            placeholder="Select a previous campaign to reuse its subject/body..."
            style={{ width: "100%" }}
            size="large"
            allowClear
            onChange={(campaignId) => {
              const selected = campaignsList.find((c) => c._id === campaignId);
              if (selected) {
                setMessageSubject(selected.subject || "");
                setMessageBody(selected.body || "");
              } else {
                setMessageSubject("");
                setMessageBody("");
              }
            }}
            options={campaignsList.map((c) => ({
              value: c._id,
              label:
                c.type === "email"
                  ? `Email: ${c.subject}`
                  : `WA: ${c.body.substring(0, 50)}${c.body.length > 50 ? "..." : ""}`,
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Subject (Required for Emails)
          </label>
          <Input
            value={messageSubject}
            onChange={(e) => setMessageSubject(e.target.value)}
            placeholder="e.g. Special Offer for {{agency_name}}"
            size="large"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Message Body</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => insertVariable("{{agency_name}}")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded border border-slate-200 transition-colors"
              >
                + Agency Name
              </button>
              <button
                type="button"
                onClick={() => insertVariable("{{license}}")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded border border-slate-200 transition-colors"
              >
                + License
              </button>
            </div>
          </div>
          <Input.TextArea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Hi {{agency_name}},\n\nWe noticed your license ({{license}}) and wanted to reach out..."
            rows={6}
            size="large"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm border border-slate-200"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
