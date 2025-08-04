import { Fragment } from "react";
import { useRouteError } from "react-router-dom";

const compilation = (error) => {
    try {
        const json = JSON.parse(error.message);
        return json;
    } catch {
        return {
            title: error.name,
            content: error.message,
        }
    }
}


export function ErrorBoundary() {
    const error = useRouteError();
    const str = compilation(error);
    return (<>
        <main className="min-h-screen bg-white text-center">
            <h1 className="text-4xl font-pacifico text-blue-600 p-4">
                MusicShare
            </h1>
            <h2 className="text-2xl font-bold text-red-500">
                {str.title}
                </h2>
            <p  className="p-2 my-1 whitespace-pre-line">
                {str.content.split('\n').map((line, idx) => (
                    <Fragment key={idx}>
                        {line}
                        <br />
                    </Fragment>
                ))}
            </p>
        </main>
    </>)
}