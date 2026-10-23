import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MdDelete, MdEdit, MdClose, MdCheckCircleOutline } from 'react-icons/md'
import { createCategory, updateCategory, deleteCategory } from '@/api/categories'
import type { Category } from '@/api/types'
import { useCategoriesStore } from '@/store/categoriesStore'
import { useSortedData } from '@/hooks/useSortedData'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import { useMessage } from '@/hooks/useMessage'
import { categorySchema, CategoryForm, firstIssue } from '@/schemas'
import Msgbox from '@/components/common/Msgbox'
import Spinner from '@/components/common/Spinner'
import FieldError from '@/components/common/FieldError'
import Table, { Column } from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const COLUMNS: Column[] = [
  { key: 'name', label: 'Category', sortable: true, width: 'w40' },
  { key: 'description', label: 'Description', sortable: false, width: 'w30' },
  { key: 'actions', label: 'Actions', sortable: false, width: 'w30', align: 'right' },
]

type CategoryDraft = { name: string; description: string }

const Categories = () => {
  const { items: cats, loading, error, fetch } = useCategoriesStore()
  const { message, showOk, showError, showWarning } = useMessage()
  const edit = useInlineEdit<CategoryDraft>()
  const sort = useSortedData(cats, { initialKey: 'name' })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    fetch()
  }, [fetch])

  const exists = (name: string, exceptId?: string) =>
    cats.some((cat) => cat._id !== exceptId && cat.name.toLowerCase() === name.toLowerCase())

  const onAdd = async ({ name, description }: CategoryForm) => {
    if (exists(name)) return showWarning('The category already exists')
    try {
      await createCategory({ name, description })
      await fetch({ force: true })
      reset()
      showOk(`Category ${name} added!`)
    } catch (error) {
      showError(error, 'Could not add the category')
    }
  }

  const onClickUpdate = async (category: Category) => {
    if (!edit.values) return
    const result = categorySchema.safeParse(edit.values)
    if (!result.success) return showWarning(firstIssue(result) ?? 'Invalid category')
    if (exists(result.data.name, category._id)) return showWarning('The category already exists')
    try {
      const { renamedInExperiences } = await updateCategory(category._id, result.data)
      await fetch({ force: true })
      edit.cancel()
      showOk(renamedInExperiences ? `Category updated in ${renamedInExperiences} experience(s)` : 'Category updated!')
    } catch (error) {
      showError(error, 'Could not update the category')
    }
  }

  // The server refuses (409) while experiences use the category
  const onClickDelete = async (category: Category) => {
    edit.cancel()
    try {
      await deleteCategory(category._id)
      await fetch({ force: true })
      showOk(`Category ${category.name} deleted!`)
    } catch (error) {
      showError(error, 'Could not delete the category')
    }
  }

  const renderRow = (category: Category) => {
    const editing = edit.isEditing(category._id) && edit.values
    const actions = editing
      ? [
        { key: 'save', icon: <MdCheckCircleOutline />, title: 'Save', onClick: onClickUpdate, className: 'btn_action green' },
        { key: 'close', icon: <MdClose />, title: 'Close', onClick: edit.cancel },
      ]
      : [
        { key: 'edit', icon: <MdEdit />, title: 'Edit', onClick: () => edit.startEdit(category._id, { name: category.name, description: category.description ?? '' }) },
        { key: 'delete', icon: <MdDelete />, title: 'Remove', onClick: onClickDelete },
      ]

    return (
      <div className="tRow" role="row" key={category._id}>
        <div className="tCol w40" role="cell">
          {editing ? (
            <input type="text" className="form_control" aria-label="Category name" maxLength={50}
              value={edit.values?.name ?? ''} onChange={(e) => edit.setField('name', e.target.value)} />
          ) : (
            <span>{category.name}</span>
          )}
        </div>
        <div className="tCol w30" role="cell">
          {editing ? (
            <input type="text" className="form_control" aria-label="Category description" maxLength={300}
              value={edit.values?.description ?? ''} onChange={(e) => edit.setField('description', e.target.value)} />
          ) : (
            <span>{category.description ?? ''}</span>
          )}
        </div>
        <div className="tCol w30" role="cell">
          <TableActions actions={actions} item={category} />
        </div>
      </div>
    )
  }

  return <div className="content cats">
    <div className="content_top">
      <h2 className="content_top_title">Categories</h2>
    </div>

    <div className="content_add">
      <form className="form" onSubmit={handleSubmit(onAdd)} noValidate>
        <div className="form_field">
          <input type="text" className="form_control" placeholder="Write your category" aria-label="Category name"
            aria-invalid={Boolean(errors.name)} maxLength={50} {...register('name')} />
          <FieldError error={errors.name} />
        </div>
        <div className="form_field">
          <input type="text" className="form_control" placeholder="Write category description" aria-label="Category description"
            maxLength={300} {...register('description')} />
          <FieldError error={errors.description} />
        </div>

        <button className="btn btn_admin" disabled={isSubmitting}>Add new category</button>
      </form>
    </div>

    {loading && <Spinner />}
    {error && <p className="msg error">{error}</p>}

    <Table label="Categories" columns={COLUMNS} data={sort.sorted} renderRow={renderRow} sort={sort} hasPagination itemsPerPage={10} />

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Categories
