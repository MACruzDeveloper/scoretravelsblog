import { useState, useEffect, useMemo, FormEvent } from 'react'
import { postData } from '@/utils/utils'
import { MdDelete, MdEdit, MdClose, MdCheckCircleOutline } from 'react-icons/md'
import { useCategoriesStore, Cat } from '@/store/categoriesStore'
import { URL } from '../../config'
import SelectContinent from '@/components/common/SelectContinent'
import Msgbox, { ParamsMsgBox } from '@/components/common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const Categories = () => {
  // fetch Categories
  const { cats, loading, error, fetchCats } = useCategoriesStore()

  // sort state
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchCats()
  }, [fetchCats])

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedCats = useMemo(() => {
    if (!sortColumn) return cats
    return [...cats].sort((a, b) => {
      const aVal = (a as any)[sortColumn]
      const bVal = (b as any)[sortColumn]
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [cats, sortColumn, sortDirection])

  const itemsPerPage = 10

  // handle form events
  const [valuesInputAdd, setValuesInputAdd] = useState<Cat>()
  const [valuesInputUpdate, setValuesInputUpdate] = useState<Cat>()
  const [message, setMessage] = useState<ParamsMsgBox>({body: '', classname: ''})
  const [updateActive, setUpdateActive] = useState<string | null>(null)
  const reg = /^[A-Za-z\s]+$/

  const handleChangeInputAdd = (e: FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValuesInputAdd({ ...valuesInputAdd, [target.name]: target.value })
  }

  const handleChangeInputUpdate = (e: FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValuesInputUpdate({ ...valuesInputUpdate, [target.name]: target.value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      let url = `${URL}/admin/categories/add`
      let result = cats.findIndex(item => item.name === valuesInputAdd.name)
      if (result === -1) {
        if (reg.exec(valuesInputAdd.name)) {
          await postData(url, { name: valuesInputAdd.name, continent: valuesInputAdd.continent })
          fetchCats()
          setMessage({ body: `Category ${valuesInputAdd.name} added!`, classname: 'msg_ok' })
        } else {
          setMessage({ body: 'The category has to be a text', classname: 'msg_error' })
        }
      } else {
        setMessage({ body: 'The category already exists', classname: 'msg_error' })
      }
      //setValuesInputAdd({})
    } catch (error) {
      console.log(error)
    }
  }

  const onClickDelete = async (ele: Cat) => {
    setUpdateActive(null)
    try {
      let url = `${URL}/admin/categories/delete`
      await postData(url, { name: ele.name })
      fetchCats()
      setMessage({ body: `Category ${ele.name} deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const onClickShowUpdate = async (idx: string) => {
    setUpdateActive(idx)
    let idCat = cats.findIndex(e => e._id === idx)
    setValuesInputUpdate({ 
      _id: idx,
      name: cats[idCat].name, 
      continent: cats[idCat].continent 
    })
  }

  const onClickCloseUpdate = async () => {
    setUpdateActive(null)
  }

  const onClickUpdate = async (idx: string) => {
    try {
      let url = `${URL}/admin/categories/update`
      if (reg.exec(valuesInputUpdate.name)) {
        await postData(url, {
          _id: idx,
          name: valuesInputUpdate.name,
          continent: valuesInputUpdate.continent
        })
        fetchCats()
        setUpdateActive(null)
        //setValuesInputUpdate('')
        setMessage({ body: `Category updated!`, classname: 'msg_ok' })
      } else {
        setMessage({ body: `Write a correct category`, classname: 'msg_error' })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const columns = [
    { key: 'name', label: 'Category', sortable: true, width: 'w40' },
    { key: 'continent', label: 'Continent', sortable: true, width: 'w30' },
    { key: 'actions', label: 'Actions', sortable: false, width: 'w30', align: 'right' }
  ]

  const renderRow = (ele: Cat) => {
    const actions = [
      {
        key: 'edit',
        icon: <MdEdit />,
        title: 'Edit',
        onClick: () => onClickShowUpdate(ele._id),
        show: () => updateActive !== ele._id,
      },
      {
        key: 'save',
        icon: <MdCheckCircleOutline />,
        title: 'Save',
        onClick: () => onClickUpdate(ele._id),
        show: () => updateActive === ele._id,
        className: 'btn_action green',
      },
      {
        key: 'close',
        icon: <MdClose />,
        title: 'Close',
        onClick: onClickCloseUpdate,
        show: () => updateActive === ele._id,
      },
      {
        key: 'delete',
        icon: <MdDelete />,
        title: 'Remove',
        onClick: () => onClickDelete(ele),
      },
    ]

    return (
      <div className="tRow" key={ele._id}>
        <div className="tCol w40">
          <span>{ele.name}</span>
        </div>
        <div className="tCol w30">
          <span>{ele.continent}</span>
          {updateActive === ele._id ? (
            <SelectContinent handleChange={handleChangeInputUpdate} selected={ele.continent} />
          ) : null}
        </div>
        <div className="tCol w30">
          <TableActions actions={actions} item={ele} />
        </div>
      </div>
    )
  }

  return <div className="content cats">
    <div className="content_top">
      <h2 className="content_top_title">Categories</h2>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          className="form_control"
          placeholder="Write your category"
          onChange={handleChangeInputAdd}
        />

        <SelectContinent handleChange={handleChangeInputAdd} />

        <button className="btn btn_admin">Add new category</button>
      </form>
    </div>

    {loading && <div>Loading...</div>}
    {error && <div>Error: {error}</div>}

    <Table
      columns={columns}
      data={sortedCats}
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

export default Categories
