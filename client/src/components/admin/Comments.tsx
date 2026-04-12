import { useState, useEffect, useMemo } from 'react'
import { postData } from '@/utils/utils'
import { sortBy } from "lodash"
import Moment from 'react-moment'
import { MdDelete } from 'react-icons/md'
import { useCommentsStore } from '@/store/commentsStore'
import { URL } from '../../config'
import Msgbox from '@/components/common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const Comments = () => {
  // fetch Comments
  const { comments, loading, error, fetchComments } = useCommentsStore()
  const [message, setMessage] = useState({ body: '', classname: '' })

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const onClickDelete = async (id: string) => {
    try {
      let url = `${URL}/admin/comments/delete`
      await postData(url, { _id: id })
      fetchComments()
      setMessage({ body: `Comment deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const [sortColumn, setSortColumn] = useState<string | null>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const itemsPerPage = 5

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedComments = useMemo(() => {
    if (!sortColumn) return sortBy(comments, ['date']).reverse()
    return [...comments].sort((a, b) => {
      const aVal = (a as any)[sortColumn]
      const bVal = (b as any)[sortColumn]
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [comments, sortColumn, sortDirection])

  const columns = [
    { key: 'user', label: 'User', sortable: true, width: 'w15' },
    { key: 'date', label: 'Date', sortable: true, width: 'w10' },
    { key: 'experience', label: 'Experience', sortable: true, width: 'w25' },
    { key: 'content', label: 'Content', sortable: false, width: 'w30' },
    { key: 'actions', label: 'Action', sortable: false, width: 'w10', align: 'center' }
  ]

  const renderRow = (ele: any) => {
    const actions = [
      {
        key: 'delete',
        icon: <MdDelete />,
        title: 'Delete',
        onClick: () => onClickDelete(ele._id),
      },
    ]

    return (
      <div className="tGroup" key={ele._id}>
        <div className="tRow">
          <div className="tCol">
            <span>{ele.user || 'Not registered'}</span>
          </div>
          <div className="tCol">
            <span><Moment format="YYYY/MM/DD">{ele.date}</Moment></span>
          </div>
          <div className="tCol">
            <span>{ele.experience}</span>
          </div>
          <div className="tCol">
            <span>{ele.content}</span>
          </div>
          <div className="tCol center">
            <TableActions actions={actions} item={ele} />
          </div>
        </div>
      </div>
    )
  }

  return <div className="content comments">
    <div className="content_top">
      <h2 className="content_top_title">Comments</h2>
    </div>

    {loading && <div>Loading...</div>}
    {error && <div>Error: {error}</div>}

    <Table
      columns={columns}
      data={sortedComments}
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

export default Comments
