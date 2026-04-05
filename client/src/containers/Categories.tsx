import { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { sortBy } from 'lodash'
import { MdDelete, MdEdit, MdClose, MdCheckCircleOutline } from 'react-icons/md'
import { useCategoriesStore, Cat } from '../store/categoriesStore'
import { URL } from '../config'
import SelectContinent from '../components/common/SelectContinent'
import Pagination from '../components/common/Pagination'
import Msgbox, { ParamsMsgBox } from '../components/common/Msgbox'

const Categories = () => {
  // fetch Categories
  const { cats, loading, error, fetchCats } = useCategoriesStore()

  useEffect(() => {
    fetchCats()
  }, [fetchCats])

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const sortedCats = sortBy(cats, [cat => cat.name.toLowerCase()])
  const currentCats = sortedCats.slice(indexOfFirstItem, indexOfLastItem)
  const paginate = (i: number) => {
    setCurrentPage(i)
    window.scrollTo(0, 0)
  }

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
          await axios.post(url, { name: valuesInputAdd.name, continent: valuesInputAdd.continent })
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
      await axios.post(url, { name: ele.name })
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
        await axios.post(url, {
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

    <div className="table_scroll">
      <div className="table">
        <div className="tRow tHead">
          <div className="tCol w40">
            <span><strong>Category</strong></span>
          </div>
          <div className="tCol w30">
            <span><strong>Continent</strong></span>
          </div>
          <div className="tCol w30 right">
            <span><strong>Actions</strong></span>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}

        {
          currentCats.length > 0 && currentCats.map((ele) => {
            return <div className="tRow" key={ele._id}>
              <div className="tCol w30">
                <span>{ele.name}</span>
              </div>
              <div className="tCol w40">
                <span>{ele.continent}</span>
                {updateActive === ele._id ?
                  <SelectContinent handleChange={handleChangeInputUpdate} selected={ele.continent} />
                  : null}
              </div>
              <div className="tCol w30">
                <div className="icons">
                  {updateActive !== ele._id ?
                    <button
                      type="button"
                      className="btn_action"
                      onClick={() => onClickShowUpdate(ele._id)}
                      title="Edit"
                    >
                      <MdEdit />
                    </button>
                    : null}

                  {updateActive === ele._id ?
                    <>
                      <button
                        type="button"
                        className="btn_action green"
                        onClick={() => onClickUpdate(ele._id)}
                        title="Save"
                      >
                        <MdCheckCircleOutline />
                      </button>
                      <button
                        type="button"
                        className="btn_action"
                        onClick={onClickCloseUpdate}
                        title="Close"
                      >
                        <MdClose />
                      </button>
                    </> : null}

                  <button
                    type="button"
                    className="btn_action"
                    onClick={() => onClickDelete(ele)}
                    title="Remove"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            </div>
          })
        }
      </div>
    </div>

    {
      cats.length > 0 && cats.length > itemsPerPage &&

      <Pagination
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={cats.length}
        paginate={paginate}
      />
    }

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Categories
