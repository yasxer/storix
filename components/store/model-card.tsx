import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ModelCardProps {
  model: {
    id: string
    name: string
  }
  categorySlug: string
  categoryImage?: string | null
  articleCount?: number
}

export function ModelCard({ model, categorySlug, categoryImage, articleCount }: ModelCardProps) {
  const modelUrl = `/category/${categorySlug}/${model.id}`

  return (
    <Link href={modelUrl}>
      <Card className="group overflow-hidden transition-all hover:shadow-md cursor-pointer border-transparent shadow-sm">
        <div className="aspect-square bg-muted/30 relative overflow-hidden flex items-center justify-center">
          {categoryImage ? (
            <Image
              src={categoryImage}
              alt={model.name}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
        </div>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-lg">{model.name}</h3>
          {articleCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {articleCount} {articleCount === 1 ? 'Article' : 'Articles'}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
