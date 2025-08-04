import { Fragment } from "react";

const init = {
    title: '정보를 가져오는 중입니다.',
    content: '잠시만 기다려주세요.',
}

export function Loading({ title = init.title, content = init.content }) {
    return (<>
        <main className="min-h-screen bg-white text-center">
            <h1 className="text-4xl font-pacifico text-blue-600 p-4">
                MusicShare
            </h1>
            <h2 className="text-2xl font-bold">
                {title}
            </h2>
            <p className="p-2 my-1 whitespace-pre-line">
                {content.split('\n').map((line, idx) => (
                    <Fragment key={idx}>
                        {line}
                        <br />
                    </Fragment>
                ))}
            </p>
            <div className="flex justify-center items-center my-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </main>
    </>)
}