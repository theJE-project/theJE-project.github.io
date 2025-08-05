import { createHashRouter } from "react-router-dom";
import {
    Layout, layoutLoader,
    Home, homeLoader,
    Group, groupLoader,
    GroupOptions, groupOptionsLoader,
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
                path: 'group/:options',
                id: 'groupOptions',
                loader: groupOptionsLoader,
                element: <GroupOptions />,
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