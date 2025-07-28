import { Outlet, useLoaderData } from "react-router-dom";
export { loader } from './loader'

export function Layout ( ) {
    const loader = useLoaderData()
    console.log(loader)
    return(<>
        hello layout components
        <Outlet />
    </>)
}