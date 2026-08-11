

export default function Header() {
    return (
        <header className="border-b bg-gray-100 border-gray-300 text-gray-900">
            <div className="container flex justify-between items-center mx-auto p-4">
                <p className="text-lg font-bold">Logo</p>
                <nav className="flex gap-2 text-sm ">
                    <a href="/about">About</a>
                    <a href="/shop">Shop</a>
                    <a href="/card">Card</a>
                    <a href="/account">Account</a>
                </nav>
            </div>
        </header>
    )
}