import { createHashRouter } from "react-router-dom";
import { 
    Layout, layoutLoader,
    Home, homeLoader,
    Group, groupLoader,
    GroupOptions, groupOptionsLoader,
    My, myloader,
} from "@pages";

export const router = createHashRouter([
    {
        path:'/',
        id: 'defult',
        loader: layoutLoader,
        element: <Layout />,
        children:[
            {
                path:'',
                id:'home',
                loader: homeLoader,
                element:<Home />,
            },
            {
                path:'group',
                id:'group',
                loader: groupLoader,
                element:<Group />,
            },
            {
                path:'group/:options',
                id:'groupOptions',
                loader: groupOptionsLoader,
                element:<GroupOptions />,
            },
            {
                path:'my',
                id:'my',
                loader: myloader,
                element:<My />
            }
        ]
    }
])