export default function DefaultTitleBarContent({ title, leftIcons, rightIcons, h1heading }: {
    title: React.ReactNode,
    leftIcons?: React.ReactNode,
    rightIcons?: React.ReactNode,
    h1heading?: boolean
}) {
  return <div className="flex items-center flex-row h-full">
    <div className="flex-1 flex items-center justify-start">
      {leftIcons || <span className="w-6" />}
    </div>
    {h1heading ? <h1 className="text-xl text-center font-semibold">{title}</h1> : <span className="text-xl text-center font-semibold">{title}</span>}
    <div className="flex-1 flex items-center justify-end">
      {rightIcons || <span className="w-6" />}
    </div>
  </div>
}