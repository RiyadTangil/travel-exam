"use client"

import { Modal, Form, Select, DatePicker, Button, Typography, Space } from "antd"
import { useEffect, useState } from "react"
import dayjs from "dayjs"

const { Text } = Typography

export type EditCompanyModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: any | null
  onSubmit: (payload: any) => Promise<boolean>
}

export function EditCompanyModal({ open, onOpenChange, company, onSubmit }: EditCompanyModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && company) {
      form.setFieldsValue({
        status: company.status || "active",
        subscriptionStatus: company.subscription?.status || "trial",
        trialEndDate: company.subscription?.trialEndDate ? dayjs(company.subscription.trialEndDate) : undefined,
        currentPeriodEnd: company.subscription?.currentPeriodEnd ? dayjs(company.subscription.currentPeriodEnd) : undefined,
      })
    } else {
      form.resetFields()
    }
  }, [open, company, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload = {
        status: values.status,
        subscription: {
          status: values.subscriptionStatus,
          trialEndDate: values.trialEndDate?.toISOString(),
          currentPeriodEnd: values.currentPeriodEnd?.toISOString(),
        }
      }

      const success = await onSubmit(payload)
      if (success) {
        onOpenChange(false)
      }
    } catch (err) {
      // Form validation failed
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Edit Company Status & Subscription"
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Save Changes"
      destroyOnHidden
      width={600}
    >
      {open && (
        <>
          {company && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md border">
              <div className="font-semibold text-lg">{company.name}</div>
              <div className="text-gray-500 text-sm">{company.email}</div>
            </div>
          )}

          <Form form={form} layout="vertical">
            <div className="mb-4">
              <Text type="secondary" className="block mb-2 font-semibold uppercase text-xs tracking-wider">Account Access</Text>
              <Form.Item 
                name="status" 
                label="Company Status" 
                help="Suspended companies cannot access the platform at all."
              >
                <Select options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Suspended (Fraud/Spam)', value: 'suspended' },
                  { label: 'Inactive', value: 'inactive' }
                ]} />
              </Form.Item>
            </div>

            <div className="mb-4">
              <Text type="secondary" className="block mb-2 font-semibold uppercase text-xs tracking-wider">Subscription Management</Text>
              <Form.Item 
                name="subscriptionStatus" 
                label="Subscription Phase"
                help="Expired companies drop into Read-Only mode automatically."
              >
                <Select options={[
                  { label: 'Trial', value: 'trial' },
                  { label: 'Active (Paid)', value: 'active' },
                  { label: 'Expired', value: 'expired' },
                  { label: 'Canceled', value: 'canceled' }
                ]} />
              </Form.Item>

              <Space className="w-full" direction="vertical">
                <Form.Item name="currentPeriodEnd" label="Subscription End Date (Paid)">
                  <DatePicker className="w-full" format="YYYY-MM-DD HH:mm:ss" showTime />
                </Form.Item>

                <Form.Item name="trialEndDate" label="Trial End Date">
                  <DatePicker className="w-full" format="YYYY-MM-DD HH:mm:ss" showTime />
                </Form.Item>
              </Space>
            </div>
          </Form>
        </>
      )}
    </Modal>
  )
}
