// @ts-nocheck
// group array by field
export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    )
    return result
  }, {})
}

// validation for emails
export const validateEmail = (email) => {
  return email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) // NOSONAR
}

// validation for size files
export const checkFileSize = (file) => {
  const maxAllowedSize = 1 * 1024 * 1024
  return file.size < maxAllowedSize
}

const parseResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || ''
    const errorBody = contentType.includes('application/json') ? await response.json() : await response.text()
    const errorMessage = errorBody?.message || JSON.stringify(errorBody) || response.statusText
    throw new Error(errorMessage)
  }
  return { data: await response.json(), status: response.status, ok: true }
}

export const fetchData = async (url, options = {}) => {
  const response = await fetch(url, options)
  return parseResponse(response)
}

export const getData = async (url, options = {}) => {
  return fetchData(url, { method: 'GET', ...options })
}

export const postData = async (url, body, options = {}) => {
  return fetchData(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: JSON.stringify(body),
    ...options
  })
}

export const deleteData = async (url, options = {}) => {
  return fetchData(url, { method: 'DELETE', ...options })
}

// scroll to Top
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}
