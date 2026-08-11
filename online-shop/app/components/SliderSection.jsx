'use client'
import {useState , useRef, useEffect, useContext} from "react"
import { StoreContext } from "@/store/StoreContext"
import AddToCard from "@/app/components/AddToCard.jsx"

export default function SliderSection(props){
    const {[props.data]: items} = useContext(StoreContext)
    const [slider, setSlider] = useState(0)
    const sliderInfo = {...items[slider]}
    const TimerRef = useRef(null)

    const handleNextSlide = () => {
        items.length-1 > slider ? setSlider(oldState => oldState+1) : setSlider(0)
    }
    const hamdlePrevSlide = () => {
        slider > 0 ? setSlider(oldState => oldState-1) : setSlider(items.length-1)
    }


    useEffect(()=>{
        TimerRef.current = setInterval(()=>{
            handleNextSlide()
        },10000)

        return ()=>{
            clearInterval(TimerRef.current)
        }
    })



    return (
        <section className="sale text-gray-900 mb-8 mt-8">
            <div className="container mx-auto px-4">
                <h1 className="title capitalize text-3xl font-bold pb-4">{props.data}</h1>

                <div className="sale-slider flex flex-col sm:flex-row mb-4 bg-gray-100 border border-gray-300 rounded-xl overflow-hidden">
                    <div className="w-[100%] md:w-1/2 ">
                        <img src={sliderInfo.photo} alt="" className="w-[100%] min-h-[100%] aspect-4/3 object-cover object-center"/>
                    </div>
                    <div className="w-[100%] md:w-1/2 p-4 flex flex-col">
                        <p className="text-lg lg:text-xl font-bold mb-2">{sliderInfo.name}</p>
                        <p className="text-sm lg:text-base font-light italic text-gray-500 mb-4">{sliderInfo.description}</p>
                        <AddToCard key={sliderInfo.id} data={sliderInfo}/>
                    </div>
                    
                </div>

                <div className="flex justify-between items-center">
                    <button onClick={hamdlePrevSlide} className="bg-gray-100 border border-gray-300 hover:bg-gray-300 p-1 text-gray-900 rounded-full cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button onClick={handleNextSlide} className="bg-gray-100 border border-gray-300 hover:bg-gray-300 p-1 text-gray-900 rounded-full cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
                
            </div>
        </section>
    )
}