"use client";

import React, { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { Modal, message } from "antd";
import { useMutationApi } from "@/hooks/api/useMutationApi";

interface BulkCampaignActionBarProps {
  selectedRecords: any[];
  messageSubject: string;
  messageBody: string;
  onSuccess: () => void;
  refetchCampaigns: () => void;
}

export function BulkCampaignActionBar({
  selectedRecords,
  messageSubject,
  messageBody,
  onSuccess,
  refetchCampaigns,
}: BulkCampaignActionBarProps) {
  const [isSending, setIsSending] = useState(false);
  const campaignMutation = useMutationApi<any>(`/api/admin/marketing-campaigns`, {
    onSuccess: () => {
      refetchCampaigns();
    }
  });

  const formatMessage = (template: string, record: any) => {
    if (!template) return "";
    const [name, license] = (record?.agency_name_license || "").split("\n");
    let formatted = template;
    formatted = formatted.replace(/{{agency_name}}/g, name || "");
    formatted = formatted.replace(
      /{{license}}/g,
      license ? license.replace("License: ", "").trim() : ""
    );
    return formatted.trim();
  };

  const formatWhatsAppNumber = (phoneStr: string) => {
    let number = phoneStr.replace(/\D/g, "");
    if (number.startsWith("01") && number.length === 11) {
      number = "88" + number;
    }
    return number;
  };

  const getWhatsAppUrl = (number: string, text: string) => {
    return text
      ? `https://web.whatsapp.com/send/?phone=${number}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`
      : `https://web.whatsapp.com/send/?phone=${number}&type=phone_number&app_absent=0`;
  };

  const handleBulkWhatsApp = () => {
    if (!messageBody) {
      message.error("Please enter a campaign message");
      return;
    }
    if (selectedRecords.length === 0) return;

    Modal.confirm({
      title: "Send Bulk WhatsApp",
      content: `Are you sure you want to open WhatsApp Web tabs for ${selectedRecords.length} agencies? Note: Ensure your browser allows multiple popups.`,
      okText: "Yes, Open Tabs",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // 1. Log the campaign and bulk history
          await campaignMutation.mutateAsync({
            type: "whatsapp",
            messageBody,
            agencyIds: selectedRecords.map((r: any) => r.id),
          });

          // 2. Open WhatsApp Web tabs
          let count = 0;
          selectedRecords.forEach((record: any) => {
            const defaultPhone =
              record.phones?.find((p: any) => p.isDefault === 1)?.number ||
              record.phones?.[0]?.number;
            const parts = (record.agency_email_number_website || "")
              .split("\n")
              .filter(Boolean);
            const phoneStr =
              defaultPhone ||
              parts.find(
                (p: string) =>
                  !p.includes("@") &&
                  !p.includes("www.") &&
                  !p.includes("http") &&
                  /[\d+]/.test(p)
              );
            if (phoneStr) {
              const number = formatWhatsAppNumber(phoneStr);
              if (number) {
                const formatted = formatMessage(messageBody, record);
                window.open(getWhatsAppUrl(number, formatted), "_blank");
                count++;
              }
            }
          });
          if (count > 0) {
            message.success(`Opened WhatsApp for ${count} agencies`);
            onSuccess();
          } else {
            message.warning("No valid phone numbers found in selected agencies");
          }
        } catch (e) {
          message.error("Failed to log campaign");
        }
      },
    });
  };



  const handleBulkEmail = () => {
    if (!messageSubject || !messageBody) {
      message.error("Please draft a subject and message body");
      return;
    }
    if (selectedRecords.length === 0) return;

    Modal.confirm({
      title: "Send Bulk Email",
      content: `Are you sure you want to send emails to ${selectedRecords.length} agencies?`,
      okText: "Yes, Send Emails",
      cancelText: "Cancel",
      onOk: async () => {
        setIsSending(true);
        try {
          // 1. Log the campaign and bulk history
          await campaignMutation.mutateAsync({
            type: "email",
            subject: messageSubject,
            messageBody,
            agencyIds: selectedRecords.map((r: any) => r.id),
          });

          // 2. Send emails
          let success = 0;
          for (const record of selectedRecords) {
            const defaultEmail =
              record.emails?.find((e: any) => e.isDefault === 1)?.address ||
              record.emails?.[0]?.address;
            const parts = (record.agency_email_number_website || "")
              .split("\n")
              .filter(Boolean);
            const emailStr = defaultEmail || parts.find((p: string) => p.includes("@"));
            if (emailStr) {
              const match = emailStr.match(
                /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
              );
              const exactEmail = match ? match[0] : emailStr.trim();
              const formatted = formatMessage(messageBody, record);
              const formattedSubject = formatMessage(messageSubject, record);
              const res = await fetch("/api/admin/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  recipients: [exactEmail],
                  subject: formattedSubject,
                  html: formatted.replace(/\n/g, "<br>"),
                }),
              });
              if (res.ok) success++;
            }
          }
          message.success(`Successfully sent ${success} emails`);
          onSuccess();
        } catch (e) {
          message.error("Error sending bulk emails or logging campaign");
        } finally {
          setIsSending(false);
        }
      },
    });
  };

  return (
    <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
      <span className="text-indigo-800 font-medium text-sm">
        {selectedRecords.length} agencies selected for campaign
      </span>
      <div className="flex gap-2">
        <button
          onClick={handleBulkEmail}
          disabled={isSending}
          className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Mail className="w-3.5 h-3.5" />
          {isSending ? "Sending..." : "Send Bulk Email"}
        </button>
        <button
          onClick={handleBulkWhatsApp}
          className="px-3 py-1.5 bg-[#25D366] text-white hover:bg-[#20bd5a] rounded text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Phone className="w-3.5 h-3.5" />
          Send Bulk WhatsApp (Tabs)
        </button>

      </div>
    </div>
  );
}

