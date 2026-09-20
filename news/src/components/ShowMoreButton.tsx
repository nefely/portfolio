export default function ShowMoreButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex justify-center mt-10">
            <button
                type="button"
                onClick={onClick}
                className="px-6 py-3 brutal-border brutal-shadow brutal-press bg-pink-400 font-extrabold uppercase"
            >
                Show more
            </button>
        </div>
    )
}
