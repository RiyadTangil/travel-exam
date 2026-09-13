"use client"

import { useState } from "react"
import { Table, Tag, Button, Typography, Dropdown, MenuProps } from "antd"
import { MoreHorizontal, ShieldAlert, Building2, Clock, MessageSquare, Receipt } from "lucide-react"
import { AdminFilterToolbar } from "@/components/admin/admin-filter-toolbar"
import { EditCompanyModal } from "@/components/admin/edit-company-modal"
import { CompanyHistoryModal } from "@/components/admin/companies/company-history-modal"
import { CompanyCampaignTemplateModal } from "@/components/admin/companies/company-campaign-template-modal"
import { SubscriptionBillModal } from "@/components/admin/companies/subscription-bill-modal"
import { useList } from "@/hooks/api/useList"
import { useMutationApi } from "@/hooks/api/useMutationApi"
import dayjs from "dayjs"

const { Title, Text } = Typography

export default function AdminCompaniesPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [editingCompany, setEditingCompany] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  
  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyCompany, setHistoryCompany] = useState<any | null>(null)
  
  // Email Campaign Modal State
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [emailCompany, setEmailCompany] = useState<any | null>(null)

  // Subscription Bill Modal State
  const [isBillOpen, setIsBillOpen] = useState(false)
  const [billCompany, setBillCompany] = useState<any | null>(null)
  const [initialAttachment, setInitialAttachment] = useState<{ name: string; size: number; base64: string } | null>(null)

  // Fetch Companies
  const { data, isLoading, refetch } = useList<any>("admin-companies", "/api/admin/companies", {
    page,
    limit,
    search,
  })

  // Fetch Campaigns for Template Reuse
  const { data: campaignsRes } = useList<any>("marketing-campaigns", "/api/admin/marketing-campaigns", {})
  const campaignsList = campaignsRes?.data || []

  const rows = data?.data?.items || []
  const total = data?.data?.total || 0

  // Update Mutation
  const { mutateAsync: updateCompany } = useMutationApi("/api/admin/companies", {
    method: "PUT",
    successMessage: "Company updated successfully",
    invalidateKeys: [["admin-companies"]],
  })

  const columns = [
    {
      title: "Company",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Users",
      dataIndex: "userCount",
      key: "userCount",
      render: (count: number) => <Tag color="blue">{count} users</Tag>,
    },
    {
      title: "Platform Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "active") return <Tag color="green">Active</Tag>
        if (status === "suspended") return <Tag color="red" icon={<ShieldAlert size={12} className="mr-1 inline" />}>Suspended</Tag>
        return <Tag color="default">Inactive</Tag>
      },
    },
    {
      title: "Subscription",
      key: "subscription",
      render: (_: any, record: any) => {
        const sub = record.subscription
        if (!sub) return <Tag>Unknown</Tag>
        
        let color = "default"
        if (sub.status === "active") color = "success"
        if (sub.status === "trial") color = "orange"
        if (sub.status === "expired") color = "error"
        if (sub.status === "canceled") color = "magenta"

        const endDate = sub.status === "trial" ? sub.trialEndDate : sub.currentPeriodEnd
        
        return (
          <div>
            <Tag color={color} className="uppercase font-bold tracking-wider">{sub.status}</Tag>
            {endDate && (
              <div className="text-[10px] mt-1 text-gray-500 font-mono">
                Ends: {dayjs(endDate).format("MMM DD, YYYY")}
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: "Last Activity Date",
      dataIndex: "lastActivityDate",
      key: "lastActivityDate",
      render: (date: string) => {
        if (!date) return <Tag color="default">No activity</Tag>

        const daysAgo = dayjs().diff(dayjs(date), "day")
        const formattedDate = dayjs(date).format("MMM DD, YYYY")
        const timeAgoText = daysAgo === 0 ? "Today" : `${daysAgo}d ago`

        let color = "success" // <= 5 days (Green)
        if (daysAgo > 10) {
          color = "error" // > 10 days (Red)
        } else if (daysAgo > 5) {
          color = "warning" // 6-10 days (Orange)
        }

        return (
          <div>
            <Tag color={color} className="font-medium">
              {formattedDate}
            </Tag>
            <div className="text-[10px] text-gray-500 mt-0.5 ml-1">
              {timeAgoText}
            </div>
          </div>
        )
      },
    },
    {
      title: "Registered",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => <span className="text-gray-500 text-sm">{dayjs(date).format("MMM DD, YYYY")}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: any, record: any) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Manage Subscription & Status',
            onClick: () => {
              setEditingCompany(record)
              setModalOpen(true)
            }
          },
          {
            key: 'history',
            label: (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Communication History</span>
              </div>
            ),
            onClick: () => {
              setHistoryCompany(record)
              setIsHistoryOpen(true)
            }
          },
          {
            key: 'email',
            label: (
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>Send Email/Message</span>
              </div>
            ),
            onClick: () => {
              setEmailCompany(record)
              setIsEmailOpen(true)
            }
          },
          {
            key: 'bill',
            label: (
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-sky-500" />
                <span className="text-sky-600 font-medium">Generate Subscription Bill</span>
              </div>
            ),
            onClick: () => {
              setBillCompany(record)
              setIsBillOpen(true)
            }
          }
        ]

        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreHorizontal className="w-4 h-4 text-gray-500" />} />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <Title level={3} className="m-0">Companies</Title>
        <Text type="secondary">Manage platform tenants and their SaaS subscriptions.</Text>
      </div>

      <AdminFilterToolbar
        showSearch
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search company name, email..."
        showRefresh
        onRefresh={() => refetch()}
      />

      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={rows}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p)
              setLimit(ps)
            },
            showTotal: (t) => `Total ${t} companies`,
          }}
          scroll={{ x: 800 }}
        />
      </div>

      <EditCompanyModal
        open={modalOpen}
        company={editingCompany}
        onOpenChange={setModalOpen}
        onSubmit={async (payload) => {
          if (!editingCompany) return false
          try {
            await updateCompany({ id: editingCompany.id, ...payload })
            return true
          } catch {
            return false
          }
        }}
      />

      <CompanyHistoryModal
        open={isHistoryOpen}
        onCancel={() => {
          setIsHistoryOpen(false)
          setHistoryCompany(null)
        }}
        company={historyCompany}
      />

      <CompanyCampaignTemplateModal
        open={isEmailOpen}
        onCancel={() => {
          setIsEmailOpen(false)
          setEmailCompany(null)
          setInitialAttachment(null)
        }}
        company={emailCompany}
        onSuccess={() => refetch()}
        campaignsList={campaignsList}
        initialAttachment={initialAttachment}
      />

      <SubscriptionBillModal
        open={isBillOpen}
        onCancel={() => {
          setIsBillOpen(false)
          setBillCompany(null)
        }}
        company={billCompany}
        attachButtonText="Send via Email (PDF)"
        onAttach={(att) => {
          const targetComp = billCompany
          setIsBillOpen(false)
          setBillCompany(null)
          setEmailCompany(targetComp)
          setInitialAttachment(att)
          setIsEmailOpen(true)
        }}
      />
    </div>
  )
}