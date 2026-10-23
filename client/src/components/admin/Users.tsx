import { useState, useEffect, useContext, useMemo, ChangeEvent } from 'react'
import { listUsers, updateUser, deleteUser } from '@/api/users'
import type { Role, User } from '@/api/types'
import { NavLink } from 'react-router-dom'
import { MyGlobalContext } from '@/components/context/useGlobalContext'
import { MdDelete, MdEdit, MdClose, MdCheckCircle } from 'react-icons/md'
import Msgbox from '@common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'


const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [newRole, setNewRole] = useState<Role>('user')
  const [newUsername, setNewUsername] = useState('')
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [updateActive, setUpdateActive] = useState<string | null>(null)

  const { setRole, user: contextUser } = useContext(MyGlobalContext)

  const typesUser = [
    { type: 'admin' },
    { type: 'user' }
  ]

  const getUsers = async () => {
    try {
      setUsers(await listUsers())
    } catch (error) {
      console.log(error)
    }
  }
  
  useEffect(() => {
    getUsers()
  }, [])

  const handleChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.currentTarget
    if (target) setNewRole(target.value as Role)
  }

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setNewUsername(target.value)
  }

  const onClickShowUpdate = async (idx: string) => {
    const idUser = users.findIndex(e => e._id === idx)
    if (idUser === -1) return
    setUpdateActive(idx)
    setNewRole(users[idUser].role)
    setNewUsername(users[idUser].username || '')
  }

  const onClickClose = async () => {
    setUpdateActive(null)
  }

  const onClickUpdate = async (idx: string) => {
    try {
      if (newUsername !== '') {
        await updateUser(idx, { role: newRole, username: newUsername })
        setUpdateActive(null)
        const edited = users.find(e => e._id === idx)
        if (edited && edited.email === contextUser) setRole(newRole)
        getUsers()
        setMessage({ body: `User updated!`, classname: 'msg_ok' })
      } else {
        setMessage({ body: 'Write a username and role', classname: 'msg_error' })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onClickDelete = async (idx: string) => {
    try {
      await deleteUser(idx)
      getUsers()
      setMessage({ body: `User deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const [sortColumn, setSortColumn] = useState<string | null>('email')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const itemsPerPage = 10

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedUsers = useMemo(() => {
    if (!sortColumn) return users
    return [...users].sort((a, b) => {
      const aVal = (a as any)[sortColumn]
      const bVal = (b as any)[sortColumn]
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [users, sortColumn, sortDirection])

  const columns = [
    { key: 'username', label: 'Username', sortable: true, width: 'w20' },
    { key: 'email', label: 'Email', sortable: true, width: 'w30' },
    { key: 'role', label: 'Role', sortable: true, width: 'w20', align: 'center' },
    { key: 'actions', label: 'Action', sortable: false, width: 'w30', align: 'right' }
  ]

  const renderRow = (ele: any) => {
    const actions = updateActive !== ele._id ? [
      {
        key: 'edit',
        icon: <MdEdit />,
        title: 'Edit',
        onClick: () => onClickShowUpdate(ele._id),
      },
      {
        key: 'delete',
        icon: <MdDelete />,
        title: 'Delete',
        onClick: () => onClickDelete(ele._id),
      },
    ] : [
      {
        key: 'save',
        icon: <MdCheckCircle />,
        title: 'Save',
        onClick: () => onClickUpdate(ele._id),
        className: 'btn_action green',
      },
      {
        key: 'close',
        icon: <MdClose />,
        title: 'Close',
        onClick: onClickClose,
      },
    ]

    return (
      <div className="tGroup" key={ele._id}>
        <div className="tRow">
          <div className="tCol">
            {updateActive !== ele._id ? (
              <span>{ele.username}</span>
            ) : (
              <input
                type="text"
                className="form_control"
                value={newUsername}
                onChange={handleChangeUsername}
              />
            )}
          </div>
          <div className="tCol">
            <span>{ele.email}</span>
          </div>
          <div className="tCol center">
            {updateActive !== ele._id ? (
              <span>{ele.role}</span>
            ) : (
              <select
                name="role"
                className="form_control"
                value={newRole}
                onChange={handleChangeNew}
              >
                {typesUser.map(item => (
                  <option key={item.type} value={item.type}>{item.type}</option>
                ))}
              </select>
            )}
          </div>
          <div className="tCol right">
            <TableActions actions={actions} item={ele} />
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

    <Table
      columns={columns}
      data={sortedUsers}
      renderRow={renderRow}
      onSort={handleSort}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      hasPagination={true}
      itemsPerPage={itemsPerPage}
    />

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Users
