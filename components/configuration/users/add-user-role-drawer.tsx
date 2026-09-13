"use client"

import { useEffect, useState } from "react"
import { Drawer, Form, Input, Select, Row, Col, Tree } from "antd"
import type { DrawerProps } from "antd"
import { PERMISSION_TREE_DATA } from "./permission-tree-data"
import { expandPermissions } from "@/lib/permissions"
import { Button } from "@/components/ui/button"

export type UserRoleRow = {
  id: string
  roleName: string
  developer: boolean
  status: "active" | "inactive"
  createdAt: string
  permissionKeys: React.Key[]
  roleType: string
  isDefault?: boolean
}

const ROLE_TYPE_OPTIONS = [
  { value: "C_ACC", label: "Accountant" },
  { value: "C_EMP", label: "Employee" },
  { value: "C_ADMIN", label: "Administrator" },
  // { value: "P_SADMIN", label: "Super Admin" },
]

export type AddUserRoleDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "view" | "edit"
  /** When mode is "view" or "edit", pass the row to display. */
  viewRole?: UserRoleRow | null
  /** Called after successful validation when mode is "add" or "edit". */
  onAddRole?: (payload: { roleName: string; roleType: string; permissionKeys: React.Key[] }) => void
} & Pick<DrawerProps, "className">

export function AddUserRoleDrawer({
  open,
  onOpenChange,
  mode,
  viewRole,
  onAddRole,
  className,
}: AddUserRoleDrawerProps) {
  const [form] = Form.useForm()
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(["perm-all", "perm-inv-other"])
  const [loading, setLoading] = useState(false)

  const isView = mode === "view"
  const isEdit = mode === "edit"

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setCheckedKeys([])
      return
    }
    if ((isView || isEdit) && viewRole) {
      form.setFieldsValue({
        roleName: viewRole.roleName,
        roleType: viewRole.roleType,
      })
      setCheckedKeys(expandPermissions((viewRole.permissionKeys as string[]) ?? []))
    } else {
      form.resetFields()
      setCheckedKeys([])
    }
  }, [open, isView, isEdit, viewRole, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleAddRole = async () => {
    if (isView) return
    try {
      const values = await form.validateFields(["roleName", "roleType"])
      setLoading(true)
      if (onAddRole) {
        await onAddRole({
          roleName: String(values.roleName).trim(),
          roleType: String(values.roleType),
          permissionKeys: checkedKeys,
        })
      }
      form.resetFields()
      setCheckedKeys([])
      onOpenChange(false)
    } catch (error) {
      // validation errors or API errors
    } finally {
      setLoading(false)
    }
  }

  const title = isView ? "View user role" : isEdit ? "Edit user role" : "Add user role"

  return (
    <Drawer
      title={<span className="text-base font-semibold text-gray-900">{title}</span>}
      placement="right"
      size={720}
      onClose={() => onOpenChange(false)}
      open={open}
      destroyOnHidden
      className={className}
      styles={{ body: { paddingBottom: 16 } }}
    >
      {open && (
        <>
          <Form form={form} layout="vertical" requiredMark colon={false}>
            <Row gutter={12} align="bottom">
              <Col xs={24} sm={8}>
                <Form.Item
                  name="roleName"
                  label={<span className="text-gray-700">Role name</span>}
                  rules={isView ? undefined : [{ required: true, message: "Enter role name" }]}
                  className="mb-0"
                >
                  <Input placeholder="Role name" size="large" readOnly={isView} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="roleType"
                  label={<span className="text-gray-700">Role Type</span>}
                  rules={isView ? undefined : [{ required: true, message: "Select an option" }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Select a option"
                    options={ROLE_TYPE_OPTIONS}
                    size="large"
                    allowClear={!isView}
                    disabled={isView}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} className="pb-1">
                {!isView ? (
                  <Button
                    onClick={handleAddRole}
                    loading={loading}
                  >
                    {isEdit ? "Update role" : "Add role"}
                  </Button>
                ) : (
                  <Button  className="w-full" onClick={handleClose}>
                    Close
                  </Button>
                )}
              </Col>
            </Row>
          </Form>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
            <div className="max-h-[min(52vh,520px)] overflow-y-auto rounded-md border border-gray-100 bg-gray-50/50 p-3">
              <Tree
                checkable
                disabled={isView}
                blockNode
                selectable={false}
                treeData={PERMISSION_TREE_DATA}
                checkedKeys={checkedKeys}
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys as React.Key[])}
                onCheck={(keys) => {
                  if (isView) return
                  const next = Array.isArray(keys) ? keys : keys.checked
                  setCheckedKeys(next)
                }}
              />
            </div>
          </div>
        </>
      )}
    </Drawer>
  )
}
