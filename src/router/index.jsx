import { createHashRouter } from "react-router-dom";
import {
    Layout, layoutLoader,
    Home, homeLoader,
    HomeDetail, homeDetailLoader,
    Group, groupLoader,
    GroupCreate, groupCreateLoader,
    GroupDetail, groupDetailLoader,
    GroupUpdate, groupUpdateLoader,
    My, myloader,
    Login,
    SignUp,
    Redirect,
    ErrorBoundary,
    Notifications,
    Search, 
} from "@pages";

export const router = createHashRouter([
    {
        path: '/',
        id: 'default',
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
                path: '/:id',
                id: 'homeDetail',
                loader:homeDetailLoader,
                element: <HomeDetail />,
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
                path: 'group/update/:id',
                id:'groupUpdate',
                loader: groupUpdateLoader,
                element:<GroupUpdate />
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
            },
                        {
                path: 'notifications',
                id: 'notifications',
                element: <Notifications />
            },
            {
                path: '/search',
                id: 'search',
                element: <Search />
            }
        ]
    }
])