//import axios from "axios"

const localHosts = ['localhost', '127.0.0.1', '0.0.0.0']
const URL = localHosts.includes(window.location.hostname)
  ? `http://localhost:3040`
  : `http://146.190.159.240`

// const customInstance = axios.create({
//   baseURL: URL,
//   headers: {'Accept': 'aplication/json'}
// })

//export default customInstance
export { URL }