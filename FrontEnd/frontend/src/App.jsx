import { BrowserRouter,Routes, Route } from 'react-router-dom'
import './App.css'

import Homepage from './homepage'
import Register from './register'
import Login from './Login'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {< Homepage />} > </Route>
        <Route path='/register' element = {< Register />}> </Route>
        <Route path='/login' element = {< Login />}> </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
