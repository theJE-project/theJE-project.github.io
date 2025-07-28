import { useRouteLoaderData } from 'react-router-dom'

export { loader } from './loader'
export function Home() {
    const { user, categories } = useRouteLoaderData('defult');
    
    return(<></>)
}