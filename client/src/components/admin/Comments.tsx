import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { MdDelete } from 'react-icons/md'
import { deleteComment } from '@/api/comments'
import type { Comment } from '@/api/types'
import { useCommentsStore } from '@/store/commentsStore'
import { useSortedData } from '@/hooks/useSortedData'
import { useMessage } from '@/hooks/useMessage'
import FormattedDate from '@/components/common/FormattedDate'
import Msgbox from '@/components/common/Msgbox'
import Spinner from '@/components/common/Spinner'
import Table, { Column } from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const COLUMNS: Column[] = [
  { key: 'user', label: 'User', sortable: true, width: 'w15' },
  { key: 'date', label: 'Date', sortable: true, width: 'w10' },
  { key: 'experience', label: 'Experience', sortable: true, width: 'w25' },
  { key: 'content', label: 'Content', sortable: false, width: 'w30' },
  { key: 'actions', label: 'Action', sortable: false, width: 'w10', align: 'center' },
]

const Comments = () => {
  const { items: comments, loading, error, fetch } = useCommentsStore()
  const { message, showOk, showError } = useMessage()
  const sort = useSortedData(comments, { initialKey: 'date', initialDirection: 'desc' })

  useEffect(() => {
    fetch()
  }, [fetch])

  const onClickDelete = async (comment: Comment) => {
    try {
      await deleteComment(comment._id)
      await fetch({ force: true })
      showOk('Comment deleted!')
    } catch (error) {
      showError(error, 'Could not delete the comment')
    }
  }

  const renderRow = (comment: Comment) => (
    <div className="tGroup" role="rowgroup" key={comment._id}>
      <div className="tRow" role="row">
        <div className="tCol" role="cell"><span>{comment.user || 'Not registered'}</span></div>
        <div className="tCol" role="cell"><span><FormattedDate date={comment.date} /></span></div>
        <div className="tCol" role="cell">
          <NavLink to={`/experience/${comment.experience}`} target="_blank">View experience</NavLink>
        </div>
        <div className="tCol" role="cell"><span>{comment.content}</span></div>
        <div className="tCol center" role="cell">
          <TableActions
            item={comment}
            actions={[{ key: 'delete', icon: <MdDelete />, title: 'Delete', onClick: onClickDelete }]}
          />
        </div>
      </div>
    </div>
  )

  return <div className="content comments">
    <div className="content_top">
      <h2 className="content_top_title">Comments</h2>
    </div>

    {loading && <Spinner />}
    {error && <p className="msg error">{error}</p>}

    <Table label="Comments" columns={COLUMNS} data={sort.sorted} renderRow={renderRow} sort={sort} hasPagination itemsPerPage={5} />

    <Msgbox {...message} />
  </div>
}

export default Comments
