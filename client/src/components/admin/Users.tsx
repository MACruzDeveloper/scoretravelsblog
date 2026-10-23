import { useState, useEffect, useContext, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { MdDelete, MdEdit, MdClose, MdCheckCircle } from 'react-icons/md'
import { listUsers, updateUser, deleteUser } from '@/api/users'
import type { Role, User } from '@/api/types'
import { MyGlobalContext } from '@/components/context/useGlobalContext'
import { useSortedData } from '@/hooks/useSortedData'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import { useMessage } from '@/hooks/useMessage'
import { firstIssue, username as usernameSchema } from '@/schemas'
import Msgbox from '@common/Msgbox'
import Table, { Column } from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const ROLES: Role[] = ['admin', 'user']

const COLUMNS: Column[] = [
  { key: 'username', label: 'Username', sortable: true, width: 'w20' },
  { key: 'email', label: 'Email', sortable: true, width: 'w30' },
  { key: 'role', label: 'Role', sortable: true, width: 'w20', align: 'center' },
  { key: 'actions', label: 'Action', sortable: false, width: 'w30', align: 'right' },
]

type UserDraft = { username: string; role: Role }

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const { setRole, user: currentEmail } = useContext(MyGlobalContext)
  const { message, showOk, showError, showWarning } = useMessage()
  const edit = useInlineEdit<UserDraft>()
  const sort = useSortedData(users, { initialKey: 'email' })

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await listUsers())
    } catch (error) {
      showError(error, 'Could not load users')
    }
  }, [showError])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const onClickUpdate = async (user: User) => {
    if (!edit.values) return
    const problem = firstIssue(usernameSchema.safeParse(edit.values.username))
    if (problem) return showWarning(problem)
    try {
      await updateUser(user._id, { username: edit.values.username.trim(), role: edit.values.role })
      // Changing my own role updates the session in the client too
      if (user.email === currentEmail) setRole(edit.values.role)
      edit.cancel()
      await loadUsers()
      showOk('User updated!')
    } catch (error) {
      showError(error, 'Could not update the user')
    }
  }

  const onClickDelete = async (user: User) => {
    try {
      await deleteUser(user._id)
      await loadUsers()
      showOk('User deleted!')
    } catch (error) {
      showError(error, 'Could not delete the user')
    }
  }

  const renderRow = (user: User) => {
    const editing = edit.isEditing(user._id)
    const actions = editing
      ? [
        { key: 'save', icon: <MdCheckCircle />, title: 'Save', onClick: onClickUpdate, className: 'btn_action green' },
        { key: 'close', icon: <MdClose />, title: 'Close', onClick: edit.cancel },
      ]
      : [
        { key: 'edit', icon: <MdEdit />, title: 'Edit', onClick: () => edit.startEdit(user._id, { username: user.username ?? '', role: user.role }) },
        { key: 'delete', icon: <MdDelete />, title: 'Delete', onClick: onClickDelete },
      ]

    return (
      <div className="tGroup" role="rowgroup" key={user._id}>
        <div className="tRow" role="row">
          <div className="tCol" role="cell">
            {editing && edit.values ? (
              <input
                type="text"
                className="form_control"
                aria-label="Username"
                value={edit.values.username}
                maxLength={30}
                onChange={(e) => edit.setField('username', e.target.value)}
              />
            ) : (
              <span>{user.username}</span>
            )}
          </div>
          <div className="tCol" role="cell"><span>{user.email}</span></div>
          <div className="tCol center" role="cell">
            {editing && edit.values ? (
              <select
                className="form_control"
                aria-label="Role"
                value={edit.values.role}
                onChange={(e) => edit.setField('role', e.target.value as Role)}
              >
                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            ) : (
              <span>{user.role}</span>
            )}
          </div>
          <div className="tCol right" role="cell">
            <TableActions actions={actions} item={user} />
          </div>
        </div>
      </div>
    )
  }

  return <div className="content users">
    <div className="content_top">
      <h2 className="content_top_title">Users</h2>
      <p className="content_top_subtitle">*To create a new user go to <NavLink to={"/register"}>Register</NavLink> page</p>
    </div>

    <Table label="Users" columns={COLUMNS} data={sort.sorted} renderRow={renderRow} sort={sort} hasPagination itemsPerPage={10} />

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Users
