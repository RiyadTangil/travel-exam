import React, { useState, useRef, useEffect } from "react";
import { Modal, Input, Button, message, Dropdown, MenuProps, Select } from "antd";
import { MessageSquare, Mail, ChevronDown, Paperclip, Upload, FileText, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { SubscriptionBillModal } from "./subscription-bill-modal";

interface CompanyCampaignTemplateModalProps {
  open: boolean;
  onCancel: () => void;
  company: any; // Current selected company
  onSuccess: () => void;
  campaignsList: any[];
  initialAttachment?: { name: string; size: number; base64: string } | null;
}

export function CompanyCampaignTemplateModal({
  open,
  onCancel,
  company,
  onSuccess,
  campaignsList,
  initialAttachment,
}: CompanyCampaignTemplateModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; size: number; base64: string } | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialAttachment) {
      setAttachment(initialAttachment);
    }
  }, [initialAttachment, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      message.error("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Content = result.split(",")[1];
      setAttachment({
        name: file.name,
        size: file.size,
        base64: base64Content,
      });
      message.success(`Attached "${file.name}"`);
    };
    reader.readAsDataURL(file);
  };

  // Template pre-fills
  const handleLoadTemplate = (templateId: string) => {
    switch (templateId) {
      case "confirmation":
        setSubject("🎉 আপনার Travel Hisab সাবস্ক্রিপশন সফলভাবে চালু হয়েছে");
        setBody(`আসসালামু আলাইকুম, {{company_name}},\n\nঅভিনন্দন! আপনার Travel Hisab সাবস্ক্রিপশন সফলভাবে সক্রিয় করা হয়েছে।\n\nআপনার সাবস্ক্রিপশনটি {{end_date}} পর্যন্ত থাকবে। এখন আপনি Travel Hisab-এর সকল প্রিমিয়াম ফিচার ব্যবহার করতে পারবেন।\n\nআমাদের উপর আস্থা রাখার জন্য আপনাকে ধন্যবাদ। আশা করি Travel Hisab আপনার ট্রাভেল এজেন্সির হিসাব ও ব্যবস্থাপনাকে আরও সহজ করবে।\n\nযেকোনো সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করতে পারেন।\n\nশুভেচ্ছান্তে,\nTravel Hisab Team`);
        break;
      case "expiration":
        setSubject("জরুরী পদক্ষেপ: আপনার Travel Hisab সাবস্ক্রিপশন শীঘ্রই শেষ হতে যাচ্ছে");
        setBody(`হ্যালো {{company_name}},\n\nএটি একটি সাধারণ রিমাইন্ডার যে আপনার Travel Hisab সাবস্ক্রিপশনটি খুব শীঘ্রই ({{end_date}}) শেষ হয়ে যাবে। প্ল্যাটফর্মে নিরবচ্ছিন্ন পরিষেবা নিশ্চিত করতে, অনুগ্রহ করে যত দ্রুত সম্ভব আপনার সাবস্ক্রিপশন রিনিউ করুন।\n\nশুভেচ্ছান্তে,\nTravel Hisab Team`);
        break;
      case "general":
        setSubject("আপনার Travel Hisab অ্যাকাউন্টের বিষয়ে গুরুত্বপূর্ণ আপডেট");
        setBody(`হ্যালো {{company_name}},\n\nআপনার অ্যাকাউন্টের বর্তমান স্ট্যাটাস (বর্তমানে: {{subscription_status}}) সম্পর্কে একটি গুরুত্বপূর্ণ আপডেট রয়েছে।\n\n[এখানে আপনার মেসেজ লিখুন]\n\nশুভেচ্ছান্তে,\nTravel Hisab Team`);
        break;
    }
  };

  const templateMenuItems: MenuProps['items'] = [
    { key: "confirmation", label: "Subscription Confirmation", onClick: () => handleLoadTemplate("confirmation") },
    { key: "expiration", label: "Expiration Alert", onClick: () => handleLoadTemplate("expiration") },
    { key: "general", label: "General Update", onClick: () => handleLoadTemplate("general") }
  ];

  const formatMessage = (template: string) => {
    if (!template || !company) return "";
    let formatted = template;
    formatted = formatted.replace(/{{company_name}}/g, company.name || "Customer");
    formatted = formatted.replace(/{{subscription_status}}/g, company.subscription?.status || "Unknown");

    const endDate = company.subscription?.status === "trial"
      ? company.subscription?.trialEndDate
      : company.subscription?.currentPeriodEnd;

    formatted = formatted.replace(/{{end_date}}/g, endDate ? dayjs(endDate).format("MMM DD, YYYY") : "soon");
    return formatted.trim();
  };

  const handleSend = async () => {
    if (!company?.email) {
      message.error("Company does not have a valid email address.");
      return;
    }

    if (!subject.trim() || !body.trim()) {
      message.error("Subject and body are required.");
      return;
    }

    setIsSending(true);
    try {
      const formattedSubject = formatMessage(subject);
      const formattedBody = formatMessage(body).replace(/\n/g, '<br>');

      const attachments = attachment
        ? [
            {
              filename: attachment.name,
              content: attachment.base64,
              encoding: "base64",
            },
          ]
        : undefined;

      const res = await fetch("/api/admin/companies/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [company.email],
          subject: formattedSubject,
          html: formattedBody,
          companyIds: [company.id],
          attachments,
        })
      });

      if (res.ok) {
        message.success("Email sent successfully!");
        onSuccess();
        onCancel();
        setSubject("");
        setBody("");
        setAttachment(null);
      } else {
        const errorData = await res.json();
        message.error(errorData.message || "Failed to send email");
      }
    } catch (error) {
      message.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-indigo-700">
          <MessageSquare className="w-5 h-5" />
          <span>Send Message to {company?.name || "Company"}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            Email Message
          </label>
          <Dropdown menu={{ items: templateMenuItems }} trigger={['click']}>
            <Button size="small" className="text-xs">
              Load Preset Template <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </Dropdown>
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
                setSubject(selected.subject || "");
                setBody(selected.body || "");
              } else {
                setSubject("");
                setBody("");
              }
            }}
            options={campaignsList.map((c) => ({
              value: c._id,
              label: c.type === "email" ? `Email: ${c.subject}` : `WA: ${c.body.substring(0, 50)}${c.body.length > 50 ? "..." : ""}`,
            }))}
          />
        </div>

        <Input
          placeholder="Email Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="font-medium"
        />

        <Input.TextArea
          placeholder="Type your message here... Use {{company_name}}, {{subscription_status}}, or {{end_date}} for variables."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="resize-none"
        />

        <div className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs text-slate-500">
          <span>Available variables: {'{{company_name}}'}, {'{{subscription_status}}'}, {'{{end_date}}'}</span>
        </div>

        {/* Attachment Section */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
          />
          {!attachment ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Attach Invoice PDF / file (Optional, max 10MB)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  type="primary"
                  icon={<FileText className="w-3.5 h-3.5" />}
                  onClick={() => setIsBillModalOpen(true)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700"
                >
                  Generate Invoice
                </Button>
                <Button
                  size="small"
                  icon={<Upload className="w-3.5 h-3.5" />}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  Upload File
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-3 py-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="p-1.5 bg-indigo-50 rounded text-indigo-600 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[320px]">
                    {attachment.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {(attachment.size / 1024).toFixed(1)} KB · Attached
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="link"
                  size="small"
                  className="text-xs text-indigo-600 px-1.5"
                  onClick={() => setIsBillModalOpen(true)}
                >
                  Regenerate
                </Button>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setAttachment(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            className="bg-indigo-600 flex items-center gap-2"
            onClick={handleSend}
            loading={isSending}
            icon={<Mail className="w-4 h-4" />}
          >
            Send Email
          </Button>
        </div>
      </div>

      <SubscriptionBillModal
        open={isBillModalOpen}
        onCancel={() => setIsBillModalOpen(false)}
        company={company}
        attachButtonText="Attach to Email (PDF)"
        onAttach={(att) => {
          setAttachment(att);
          setIsBillModalOpen(false);
        }}
      />
    </Modal>
  );
}
