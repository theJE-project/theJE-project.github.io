import { createHashRouter } from "react-router-dom";
import {
    Layout, layoutLoader,
    Home, homeLoader,
    Group, groupLoader,
    GroupCreate, groupCreateLoader,
    GroupDetail, groupDetailLoader,
    My, myloader,
    Login,
    SignUp,
    Redirect,
    ErrorBoundary,
} from "@pages";

export const router = createHashRouter([
    {
        path: '/',
        id: 'defult',
        loader: layoutLoader,
        element: <Layout />,
        // errorElement: <ErrorBoundary />,
        children: [
            {
                path: '',
                id: 'home',
                loader:homeLoader,
                element: <Home />,
            },
            {
                path: 'group',
                id: 'group',
                loader: groupLoader,
                element: <Group />,
            },
            {
                path: 'group/create',
                id: 'groupCreate',
                loader: groupCreateLoader,
                element: <GroupCreate />,
            },
            {
                path: 'group/:id',
                id:'groupDetail',
                loader: groupDetailLoader,
                element:<GroupDetail />
            },
            {
                path: 'my',
                id: 'my',
                loader: myloader,
                element: <My />
            },
            {
                path: 'login',
                id: 'login',
                element: <Login />,
            },
            {
                path: 'login/signUp',
                id: 'signUp',
                element: <SignUp />

            },
            {
                path: 'login/redirect',
                id: 'redirect',
                element: <Redirect />
            }
        ]
    }
])