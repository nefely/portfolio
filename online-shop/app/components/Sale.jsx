'use client'

import {useState , useRef, useEffect} from "react"

const initialStore = [
    {
        id: 1,
        name: "Яблука",
        stock: 42,
        price: 35,
        unit: "kg",
        photo: "/products/apples.jpg",
        description: "Свіжі яблука сорту Голден, солодкі та соковиті.",
    },
    {
        id: 2,
        name: "Банани",
        stock: 30,
        price: 55,
        unit: "kg",
        photo: "/products/bananas.jpg",
        description: "Стиглі банани, ідеальні для перекусу чи смузі.",
    },
    {
        id: 3,
        name: "Молоко 1л",
        stock: 15,
        price: 42,
        unit: "pcs",
        photo: "/products/milk.jpg",
        description: "Пастеризоване молоко 2.5% жирності, 1 літр.",
    },
    {
        id: 4,
        name: "Хліб пшеничний",
        stock: 20,
        price: 28,
        unit: "pcs",
        photo: "/products/bread.jpg",
        description: "Свіжоспечений пшеничний хліб, буханка 500 г.",
    },
    {
        id: 5,
        name: "Помідори",
        stock: 25,
        price: 60,
        unit: "kg",
        photo: "/products/tomatoes.jpg",
        description: "Соковиті грунтові помідори.",
    },
]

export default function Sale(){
    const [slider, setSlider] = useState(0)
    const sliderInfo = {...initialStore[slider]}
    const TimerRef = useRef(null)

    const handleNextSlide = () => {
        initialStore.length-1 > slider ? setSlider(oldState => oldState+1) : setSlider(0)
    }
    const hamdlePrevSlide = () => {
        slider > 0 ? setSlider(oldState => oldState-1) : setSlider(initialStore.length-1)
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
                <h1 className="title text-3xl font-bold pb-4">Sale</h1>

                <div className="sale-slider flex flex-col md:flex-row mb-4 bg-gray-100 border border-gray-300 rounded-xl overflow-hidden">
                    <div className="w-[100%] md:w-1/2 ">
                        <img src={sliderInfo.photo} alt="" className="w-[100%] min-h-[100%] aspect-4/3 object-cover object-center"/>
                    </div>
                    <div className="w-[100%] md:w-1/2 p-4 flex flex-col">
                        <p className="text-lg lg:text-xl font-bold mb-2">{sliderInfo.name}</p>
                        <p className="text-sm lg:text-base font-light italic text-gray-500 mb-4">{sliderInfo.description}</p>
                        <div className="flex justify-center items-center mt-auto">
                            <button className="bg-blue-600 hover:bg-blue-800 w-full px-6 py-2 text-white font-bold rounded-sm cursor-pointer">Add To Card</button>
                        </div>
                    </div>
                    
                </div>

                <div className="flex justify-between items-center">
                    <button onClick={hamdlePrevSlide} className="bg-gray-100 border border-gray-300 hover:bg-gray-300 p-2 text-gray-900 rounded-full cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button onClick={handleNextSlide} className="bg-gray-100 border border-gray-300 hover:bg-gray-300 p-2 text-gray-900 rounded-full cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
                
            </div>
        </section>
    )
}