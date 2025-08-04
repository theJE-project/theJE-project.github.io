import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@router'
import { Loading } from '@pages';
import './main.css';

function App(){

  return(<>
    <RouterProvider 
      router={router}
      fallbackElement={<Loading />}
    />
  </>)
}

createRoot(document.getElementById('root')).render(<App />)
