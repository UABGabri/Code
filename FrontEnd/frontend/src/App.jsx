import { BrowserRouter,Routes, Route } from 'react-router-dom'
import './App.css'

import Homepage from './homepage'
import Register from './register'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {< Homepage />} > </Route>
        <Route path='/register' element = {< Register />}> </Route>
        <Route path='/login' element = {< Register />}> </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
