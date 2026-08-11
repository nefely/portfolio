import Header from "@/app/components/Header.jsx";
import SliderSection from "@/app/components/SliderSection.jsx";
import GridSection from "@/app/components/GridSection.jsx";
import CardSection from "@/app/components/CardSection.jsx";
import { StoreProvider } from "@/store/StoreContext";

export default function Home() {
  return (
    <StoreProvider>
      <div>
        <Header />
        <CardSection />
        <SliderSection data="sale" />
        <GridSection data="products"/>
        <GridSection data="favorites"/>
      </div>
    </StoreProvider>
  );
}
