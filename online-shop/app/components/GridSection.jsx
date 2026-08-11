"use client"
import {useContext} from "react"
import { StoreContext } from "@/store/StoreContext"
import AddToCard from "@/app/components/AddToCard.jsx"

export default function GridSection(props) {
    const { [props.data]: items } = useContext(StoreContext)

    return (
        <section className="shop text-gray-900 mb-8">
            <div className="container mx-auto px-4">
                <h1 className="title text-3xl font-bold capitalize pb-4">{props.data}</h1>
                <div className="products-grid grid gap-2 sm:gap-4 grid-cols-[repeat(auto-fit,minmax(170px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                    {items.map((item)=> (
                        <div key={item.id} className="bg-gray-100 border border-gray-300 rounded-sm overflow-hidden flex flex-col">
                            <div className="flex justify-center items-center">
                                <img src={item.photo} alt="" className="aspect-4/3 w-[100%] object-center object-cover"/>
                            </div>
                            <div className="p-2 sm:p-4 flex flex-col flex-1">
                                <p className="text-base sm:text-lg font-bold mb-2">{item.name}</p>
                                <p className="text-xs sm:text-sm font-light italic text-gray-500 mb-4">{item.description}</p>
                                <AddToCard data={item}/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}