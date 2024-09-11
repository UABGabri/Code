import { BrowserRouter,Routes, Route } from 'react-router-dom'
import './App.css'

import Homepage from './Homepage'
import Register from './Register'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {< Homepage />} > </Route>
        <Route path='/' element = {< Register />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
