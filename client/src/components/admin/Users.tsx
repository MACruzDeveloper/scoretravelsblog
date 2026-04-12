import { useState, useEffect, useContext, useMemo, ChangeEvent } from 'react'
import { getData, postData } from '@utils/utils'
import { NavLink } from 'react-router-dom'
import { MyGlobalContext } from '../../App'
import { MdDelete, MdEdit, MdClose, MdCheckCircle } from 'react-icons/md'
import { URL } from '../../config'
import Msgbox from '@common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const Users = () => {
  const [users, setUsers] = useState([])
  const [newRole, setNewRole] = useState('')
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [updateActive, setUpdateActive] = useState(null)

  const { setRole } = useContext(MyGlobalContext)

  const typesUser = [
    { type: 'admin' },
    { type: 'author' }
  ]

  const getUsers = async () => {
    let url = `${URL}/users`
    try {
      const res = await getData(url)
      setUsers(res.data)
    } catch (error) {
      console.log(error)
    }
  }
  
  useEffect(() => {
    getUsers()
  }, [])

  const handleChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.currentTarget
    if (target) setNewRole(target.value)
  }

  const onClickShowUpdate = async (idx: string) => {
    setUpdateActive(idx)
    let idUser = users.findIndex(e => e._id === idx)
    setNewRole(users[idUser].role)
  }

  const onClickClose = async () => {
    setUpdateActive(null)
  }

  const onClickUpdate = async (idx: string) => {
    try {
      let url = `${URL}/users/update`
      if (newRole !== '') {
        await postData(url, { _id: idx, role: newRole })
        setUpdateActive(null)
        setRole(newRole)
        getUsers()
        setMessage({ body: `User updated!`, classname: 'msg_ok' })
      } else {
        setMessage({ body: 'Write a role', classname: 'msg_error' })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onClickDelete = async (idx: string) => {
    try {
      let url = `${URL}/users/delete`
      await postData(url, { _id: idx })
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
    { key: 'email', label: 'Email', sortable: true, width: 'w40' },
    { key: 'password', label: 'Password', sortable: false, width: 'w30', align: 'scroll' },
    { key: 'role', label: 'Role', sortable: true, width: 'w20', align: 'center' },
    { key: 'actions', label: 'Action', sortable: false, width: 'w10', align: 'right' }
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
            <span>{ele.email}</span>
          </div>
          <div className="tCol scroll">
            <span>{ele.password}</span>
          </div>
          <div className="tCol center">
            {updateActive !== ele._id ? (
              <span>{ele.role}</span>
            ) : (
              <select
                name="role"
                className="form_control"
                defaultValue={ele.role}
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
