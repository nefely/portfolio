import {useState} from "react";

export default function AddToCard(props) {

    const [counter , setCounter] = useState(0)
    const price = props?.data?.price * counter

    const handleAddClick = () => {
        setCounter(oldState => oldState+1)
    }
    const handleRemoveProduct = () => {
        counter > 0 ? setCounter(oldState => oldState-1) : null
    }

    return (
        <>
            {counter === 0 && (
                <div className="flex justify-center items-center mt-auto">
                    <button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-800 w-full px-3 py-1 sm:px-6 sm:py-2 text-white font-bold rounded-sm cursor-pointer">Add To Card</button>
                </div>
            )}

            {counter > 0 && (
            <>
                <p className="mb-1">price: {price} $</p>
                
                <div className="flex justify-center items-center mt-auto gap-3">
                    <button onClick={handleRemoveProduct} className="bg-red-600 hover:bg-red-800 px-3 py-1 sm:px-4 sm:py-2 text-white font-bold rounded-sm cursor-pointer">-</button>
                    <p className="bg-gray-300 px-3 py-1 sm:px-4 sm:py-2 text-gray-900 font-bold rounded-sm cursor-pointer">{counter}</p>
                    <button onClick={handleAddClick} className="bg-green-600 hover:bg-green-800 px-3 py-1 sm:px-4 sm:py-2 text-white font-bold rounded-sm cursor-pointer">+</button>
                </div>
            </>
            )}
        </>
    )
}