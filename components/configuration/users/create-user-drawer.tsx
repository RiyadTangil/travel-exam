"use client"

import { useEffect, useState } from "react"
import { Drawer, Form, Input, Select, Row, Col, Space, message } from "antd"
import type { DrawerProps } from "antd"
import { useSession } from "next-auth/react"
import axios from "axios"
import { Button } from "@/components/ui/button"

const mobilePrefixes = [
  { value: "+88", label: "+88" },
  { value: "+91", label: "+91" },
  { value: "+1", label: "+1" },
]

export type CreateUserDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserSaved?: (user: any) => void
  mode?: "add" | "edit"
  viewUser?: any | null
} & Pick<DrawerProps, "className">

export function CreateUserDrawer({ open, onOpenChange, onUserSaved, mode = "add", viewUser, className }: CreateUserDrawerProps) {
  const { data: session } = useSession()
  const [form] = Form.useForm()
  const [roles, setRoles] = useState<{ label: string; value: string; roleType: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && session?.user?.companyId) {
      axios
        .get("/api/configuration/roles", { headers: { "x-company-id": session.user.companyId }, params: { pageSize: 100 } })
        .then((res) => {
          setRoles(res.data.data.items.map((r: any) => ({ label: r.roleName, value: r.id, roleType: r.roleType })))
        })
        .catch((err) => {
          console.error("Failed to fetch roles", err)
        })
    }
  }, [open, session?.user?.companyId])

  useEffect(() => {
    if (!open) {
      form.resetFields()
    } else if (mode === "edit" && viewUser) {
      const [firstName, ...rest] = (viewUser.fullName || "").split(" ")
      const lastName = rest.join(" ")
      
      let mobilePrefix = "+88"
      let mobile = viewUser.mobile || ""
      for (const p of mobilePrefixes) {
        if (mobile.startsWith(p.value)) {
          mobilePrefix = p.value
          mobile = mobile.substring(p.value.length)
          break
        }
      }

      form.setFieldsValue({
        firstName,
        lastName,
        userName: viewUser.userName !== "—" ? viewUser.userName : "",
        emailLocal: viewUser.userEmail,
        mobilePrefix,
        mobile: mobile !== "—" ? mobile : "",
        userRole: viewUser.roleId,
      })
    }
  }, [open, mode, viewUser, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (values.password && values.password !== values.confirmPassword) {
        message.error("Passwords do not match")
        return
      }

      setLoading(true)
      const selectedRole = roles.find(r => r.value === values.userRole)
      const payload: any = {
        fullName: `${values.firstName} ${values.lastName}`.trim(),
        userName: values.userName,
        userEmail: values.emailLocal,
        mobile: `${values.mobilePrefix || ""}${values.mobile || ""}`,
        roleId: values.userRole,
        userRole: selectedRole?.roleType?.toUpperCase() || "C_EMP",
      }
      if (values.password) {
        payload.password = values.password
      }

      if (mode === "edit" && viewUser) {
        const res = await axios.put(`/api/configuration/users/${viewUser.id}`, payload, {
          headers: { "x-company-id": session?.user?.companyId },
        })
        message.success("User updated successfully")
        if (onUserSaved) onUserSaved(res.data)
      } else {
        const res = await axios.post("/api/configuration/users", payload, {
          headers: { "x-company-id": session?.user?.companyId },
        })
        message.success("User created successfully")
        if (onUserSaved) onUserSaved(res.data)
      }
      onOpenChange(false)
    } catch (error: any) {
      if (error.response) {
        message.error(error.response?.data?.message || error.response?.data?.error || `Failed to ${mode === "edit" ? "update" : "create"} user`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      title={<span className="text-base font-semibold text-gray-900">{mode === "edit" ? "Edit User" : "Create a new user"}</span>}
      placement="right"
      onClose={() => onOpenChange(false)}
      open={open}
      destroyOnHidden
      width={720}     
      className={className}
      styles={{
        body: { paddingBottom: 8 },
      }}
  
      footer={
        <div className="flex justify-end border-t border-gray-100 pt-3 -mx-6 px-6 -mb-2 pb-1 bg-white">
          <Button
            onClick={handleSubmit}
            loading={loading}
          >
            Submit
          </Button>
        </div>
      }
    >
      {open && (
        <Form form={form} layout="vertical" requiredMark className="mt-1" colon={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label={<span className="text-gray-700">First Name</span>}
                rules={[{ required: true, message: "Enter first name" }]}
              >
                <Input placeholder="First name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label={<span className="text-gray-700">Last Name</span>}
                rules={[{ required: true, message: "Enter last name" }]}
              >
                <Input placeholder="Last name" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userName"
                label={<span className="text-gray-700">User Name</span>}
                rules={[{ required: true, message: "Enter user name" }]}
              >
                <Input placeholder="User Name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emailLocal"
                label={<span className="text-gray-700">Email</span>}
                rules={[{ required: true, type: "email", message: "Enter valid email" }]}
              >
                <Input placeholder="Email" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span className="text-gray-700">Mobile</span>}>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item name="mobilePrefix" noStyle initialValue="+88">
                    <Select options={mobilePrefixes} size="large" style={{ width: "35%" }} />
                  </Form.Item>
                  <Form.Item name="mobile" noStyle>
                    <Input placeholder="Mobile" size="large" style={{ width: "65%" }} />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="userRole"
                label={<span className="text-gray-700">User Role</span>}
                rules={[{ required: true, message: "Select a role" }]}
              >
                <Select placeholder="Select role" options={roles} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label={<span className="text-gray-700">Password</span>}
                rules={mode === "add" ? [{ required: true, message: "Enter password" }] : []}
              >
                <Input.Password placeholder="Password" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label={<span className="text-gray-700">Confirm Password</span>}
                rules={mode === "add" ? [{ required: true, message: "Confirm password" }] : []}
              >
                <Input.Password placeholder="Confirm password" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Drawer>
  )
}
