"use client"

import React, { useEffect } from "react"
import { Form, Input, DatePicker, Select } from "antd"
import dayjs from "dayjs"
import { SharedModal } from "@/components/shared/shared-modal"
import { UserSelection } from "@/components/shared/user-selection"
import {
  TaskItem,
  TASK_CATEGORY_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from "./types"

export interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskItem | null
  onSubmit: (values: {
    clientName: string
    mobile: string
    title: string
    dueDate: string
    assignedTo: string
    category: any
    priority: any
  }) => Promise<void>
  loading?: boolean
}

export function TaskFormModal({
  open,
  onOpenChange,
  task,
  onSubmit,
  loading = false,
}: TaskFormModalProps) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (task) {
        form.setFieldsValue({
          clientName: task.clientName,
          mobile: task.mobile || "",
          title: task.title,
          dueDate: task.dueDate ? dayjs(task.dueDate) : dayjs(),
          assignedTo: task.assignedTo,
          category: task.category || "GENERAL_CALL",
          priority: task.priority || "HIGH",
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          dueDate: dayjs(),
          priority: "HIGH",
          category: "GENERAL_CALL",
        })
      }
    } else {
      form.resetFields()
    }
  }, [open, task, form])

  const handleFinish = async () => {
    try {
      const values = await form.validateFields()
      const formattedDueDate = values.dueDate
        ? values.dueDate.format("YYYY-MM-DD HH:mm")
        : dayjs().format("YYYY-MM-DD HH:mm")

      await onSubmit({
        clientName: values.clientName,
        mobile: values.mobile || "",
        title: values.title,
        dueDate: formattedDueDate,
        assignedTo: values.assignedTo,
        category: values.category || "GENERAL_CALL",
        priority: values.priority || "HIGH",
      })
    } catch (err) {
      console.error("Task form validation error:", err)
    }
  }

  return (
    <SharedModal
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Edit Task / Reminder" : "Schedule Task / Reminder"}
      submitText={task ? "Update Task" : "Save Task"}
      cancelText="Cancel"
      onSubmit={handleFinish}
      onCancel={() => onOpenChange(false)}
      loading={loading}
      maxWidth="max-w-lg"
    >
      <Form form={form} layout="vertical" className="pt-1">
        <Form.Item
          name="clientName"
          label="Client Name"
          rules={[{ required: true, message: "Client name is required" }]}
        >
          <Input placeholder="e.g. Hasib Munshi" />
        </Form.Item>

        <Form.Item name="mobile" label="Mobile Number">
          <Input placeholder="e.g. 01824466952" />
        </Form.Item>

        <Form.Item
          name="title"
          label="Task Description / Note"
          rules={[{ required: true, message: "Task description is required" }]}
        >
          <Input.TextArea
            rows={2}
            placeholder="e.g. Call client regarding Indian Visa 15-day expiry renewal"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="dueDate"
            label="Exact Date & Time"
            rules={[{ required: true, message: "Date & time is required" }]}
          >
            <DatePicker
              showTime
              className="w-full"
              format="YYYY-MM-DD HH:mm"
              placeholder="Date & Time"
            />
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label="Assign To User"
            rules={[{ required: true, message: "Assigned user is required" }]}
          >
            <UserSelection placeholder="Select user" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="category"
            label="Task Category"
            initialValue="GENERAL_CALL"
          >
            <Select options={TASK_CATEGORY_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            initialValue="HIGH"
          >
            <Select options={TASK_PRIORITY_OPTIONS} />
          </Form.Item>
        </div>
      </Form>
    </SharedModal>
  )
}
