import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter,Routes, Route } from 'react-router-dom'
import './App.css'
import homepage from './homepage'
import register from './register'

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<homepage />}></Route>
        <Route path='/' element = {<register />}></Route>

      </Routes>
    </BrowserRouter>
  )
      
}

export default App
