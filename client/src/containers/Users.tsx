import { useState, useEffect, useContext, ChangeEvent } from 'react'
import { getData, postData } from '../utils/utils'
import { NavLink } from 'react-router-dom'
import { MyGlobalContext } from '../App'
import { MdDelete, MdEdit, MdClose, MdCheckCircle } from 'react-icons/md'
import { URL } from '../config'
import Msgbox from '../components/common/Msgbox'

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

  const handleChangeNew = (e: ChangeEvent<HTMLInputElement>) => {
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

  return <div className="content users">
    <div className="content_top">
      <h2 className="content_top_title">Users</h2>
      <p className="content_top_subtitle">*To create a new user go to <NavLink to={"/register"}>Register</NavLink> page</p>
    </div>

    <div className="table_scroll">
      <div className="table">
        <div className="tGroup tHead">
          <div className="tRow">
            <div className="tCol w40"><span><strong>Email</strong></span></div>
            <div className="tCol w30 scroll"><span><strong>Password</strong></span></div>
            <div className="tCol w20 center"><span><strong>Role</strong></span></div>
            <div className="tCol w10 right"><span><strong>Action</strong></span></div>
          </div>
        </div>
        {
          users.map((ele) => {
            return <div className="tGroup" key={ele._id}>
              <div className="tRow">
                <div className="tCol">
                  <span>{ele.email}</span>
                </div>
                <div className="tCol scroll">
                  <span>{ele.password}</span>
                </div>
                <div className="tCol center">
                  {updateActive !== ele._id ?
                    <span>{ele.role}</span>
                    :
                    <select 
                      name="role"
                      className="form_control" 
                      defaultValue={ele.role} 
                      onChange={() => handleChangeNew}
                    >
                      {typesUser.map(ele => {
                        return <option key={ele.type} value={ele.type}>{ele.type}</option>
                      })}
                    </select>
                  }
                </div>
                <div className="tCol">
                  <div className="icons">
                    {!updateActive ?
                      <>
                        <button className="btn_action" onClick={() => onClickShowUpdate(ele._id)}>
                          <MdEdit />
                        </button>
                        <button className="btn_action" onClick={() => onClickDelete(ele._id)}>
                          <MdDelete />
                        </button>
                      </>
                      : 
                      <>
                        <button className="btn_action green" onClick={() => onClickUpdate(ele._id)}>
                          <MdCheckCircle />
                        </button>
                        <button className="btn_action" onClick={onClickClose}>
                          <MdClose />
                        </button>
                      </>
                    }
                  </div>
                </div>
              </div>
            </div>
          })
        }
      </div>
    </div>

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Users
