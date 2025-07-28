import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@router'
import './main.css';

function App(){

  return(<>
    <RouterProvider router={router}/>
  </>)
}

createRoot(document.getElementById('root')).render(<App />)
