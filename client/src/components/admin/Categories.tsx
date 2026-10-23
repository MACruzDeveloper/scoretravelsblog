import { useState, useEffect, useMemo, FormEvent } from 'react'
import { getErrorMessage } from '@/utils/errors'
import { createCategory, updateCategory, deleteCategory } from '@/api/categories'
import { MdDelete, MdEdit, MdClose, MdCheckCircleOutline } from 'react-icons/md'
import { useCategoriesStore, Cat } from '@/store/categoriesStore'
import Msgbox, { ParamsMsgBox } from '@/components/common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const reg = /^[\p{L}\p{N}\s]+$/u

const Categories = () => {
  // fetch Categories
  const { cats, loading, error, fetchCats } = useCategoriesStore()

  // sort state
  const [sortColumn, setSortColumn] = useState<string | null>('name')
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
  const [valuesInputAdd, setValuesInputAdd] = useState<Partial<Cat>>({ name: '', description: '' })
  const [valuesInputUpdate, setValuesInputUpdate] = useState<Partial<Cat>>({ name: '', description: '' })
  const [message, setMessage] = useState<ParamsMsgBox>({body: '', classname: ''})
  const [updateActive, setUpdateActive] = useState<string | null>(null)

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
      const name = valuesInputAdd.name?.trim() ?? ''
      const description = valuesInputAdd.description?.trim() ?? ''
      const result = cats.findIndex(item => item.name.toLowerCase() === name.toLowerCase())
      if (result === -1) {
        if (reg.exec(name)) {
          await createCategory({ name, description })
          await fetchCats(true)
          setValuesInputAdd({ name: '', description: '' })
          setMessage({ body: `Category ${name} added!`, classname: 'msg_ok' })
        } else {
          setMessage({ body: 'The category has to be a text', classname: 'msg_error' })
        }
      } else {
        setMessage({ body: 'The category already exists', classname: 'msg_error' })
      }
    } catch (error) {
      console.log(error)
      setMessage({ body: getErrorMessage(error, 'Could not add the category'), classname: 'msg_error' })
    }
  }

  const onClickDelete = async (ele: Cat) => {
    setUpdateActive(null)
    try {
      await deleteCategory(ele._id)
      await fetchCats(true)
      setMessage({ body: `Category ${ele.name} deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
      setMessage({ body: getErrorMessage(error, 'Could not delete the category'), classname: 'msg_error' })
    }
  }

  const onClickShowUpdate = async (idx: string) => {
    const idCat = cats.findIndex(e => e._id === idx)
    if (idCat === -1) return
    setUpdateActive(idx)
    setValuesInputUpdate({ 
      _id: idx,
      name: cats[idCat].name,
      description: cats[idCat].description ?? ''
    })
  }

  const onClickCloseUpdate = async () => {
    setUpdateActive(null)
    setValuesInputUpdate({})
  }

  const onClickUpdate = async (idx: string) => {
    try {
      const updatedName = valuesInputUpdate.name?.trim() ?? ''
      const updatedDescription = valuesInputUpdate.description?.trim() ?? ''
      if (reg.exec(updatedName)) {
        await updateCategory(idx, {
          name: updatedName,
          description: updatedDescription
        })
        await fetchCats(true)
        setUpdateActive(null)
        setValuesInputUpdate({ name: '', description: '' })
        setMessage({ body: `Category updated!`, classname: 'msg_ok' })
      } else {
        setMessage({ body: `Write a correct category`, classname: 'msg_error' })
      }
    } catch (error) {
      console.log(error)
      setMessage({ body: getErrorMessage(error, 'Could not update the category'), classname: 'msg_error' })
    }
  }

  const columns = [
    { key: 'name', label: 'Category', sortable: true, width: 'w40' },
    { key: 'description', label: 'Description', sortable: false, width: 'w30' },
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

    const isEditing = updateActive === ele._id

    return (
      <div className="tRow" key={ele._id}>
        <div className="tCol w40">
          {isEditing ? (
            <input
              type="text"
              name="name"
              className="form_control"
              value={valuesInputUpdate.name ?? ''}
              onChange={handleChangeInputUpdate}
            />
          ) : (
            <span>{ele.name}</span>
          )}
        </div>
        <div className="tCol w30">
          {isEditing ? (
            <input
              type="text"
              name="description"
              className="form_control"
              value={valuesInputUpdate.description ?? ''}
              onChange={handleChangeInputUpdate}
            />
          ) : (
            <span>{ele.description ?? ''}</span>
          )}
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
    </div>

    <div className="content_add">
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          className="form_control"
          placeholder="Write your category"
          value={valuesInputAdd.name ?? ''}
          onChange={handleChangeInputAdd}
        />
        <input
          type="text"
          name="description"
          className="form_control"
          placeholder="Write category description"
          value={valuesInputAdd.description ?? ''}
          onChange={handleChangeInputAdd}
        />

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
