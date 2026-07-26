import { type Ref } from 'react'

export default function Title({ title, leftIcons, rightIcons, ref }: { title: string, leftIcons?: React.ReactNode, rightIcons?: React.ReactNode, ref?: Ref<HTMLHeadingElement | null> }) {
    return <div className="mb-5 flex items-center justify-between">
        {leftIcons ?
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center justify-start">
                    {leftIcons || <span className="w-6" />}
                </div>
                <h1 className="text-3xl font-bold" ref={ref}>{title}</h1>
            </div>
        :
            <h1 className="text-3xl font-bold" ref={ref}>{title}</h1>
        }
        <div className="flex-1 flex items-center justify-end">
            {rightIcons || <span className="w-6" />}
        </div>
    </div>
}