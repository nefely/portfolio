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

export default function Shop() {
    return (
        <section className="shop text-gray-900 mb-8">
            <div className="container mx-auto px-4">
                <h1 className="title text-3xl font-bold pb-4">Shop</h1>
                <div className="products-grid grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                    {initialStore.map((item)=> (
                        <div key={item.id} className="bg-gray-100 border border-gray-300 rounded-sm overflow-hidden flex flex-col">
                            <div className="flex justify-center items-center">
                                <img src={item.photo} alt="" className="aspect-4/3 w-[100%] object-center object-cover"/>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <p className="text-lg lg:text-xl font-bold mb-2">{item.name}</p>
                                <p className="text-sm lg:text-base font-light italic text-gray-500 mb-4">{item.description}</p>
                                <div className="flex justify-center items-center mt-auto">
                                    <button className="bg-blue-600 hover:bg-blue-800 w-full px-6 py-2 text-white font-bold rounded-sm cursor-pointer">Add To Card</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}