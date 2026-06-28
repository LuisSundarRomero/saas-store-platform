import { ImageSlider } from '@/components/ui/ImageSlider'

interface Slide {
  src: string
  href: string
  alt?: string
}

interface Props {
  slides: Slide[]
  slideBg?: string
}

export function HeroCarousel({ slides, slideBg }: Props) {
  return (
    <ImageSlider
      mode="banner"
      slides={slides}
      aspectRatio="auto"
      autoplayMs={5000}
      slideBg={slideBg}
    />
  )
}
