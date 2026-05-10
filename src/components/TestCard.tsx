export default function TestCard() {
    return <div className="px-1 py-3">
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <p className="text-3xl font-bold px-4 mt-4">Test Title</p>
            <p className="px-4 mb-4">This is a test description.</p>
            <img src="/dummy.jpg" />
        </div>
    </div>
}