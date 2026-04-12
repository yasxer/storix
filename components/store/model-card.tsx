import Link from "next/link"
import { Image as ImageIcon } from "lucide-react"

interface ModelCardProps {
  model: {
    id: string
    name: string
    photo_url?: string | null
  }
  categorySlug: string
  categoryImage?: string | null
  articleCount?: number
}

export function ModelCard({ model, categorySlug, categoryImage, articleCount }: ModelCardProps) {
  const modelUrl = `/category/${categorySlug}/${model.id}`

  return (
    <Link href={modelUrl}>
      <div 
        className="group overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
        style={{ borderRadius: '30px', boxShadow: 'var(--wise-ring)', background: '#ffffff' }}
      >
        <div className="aspect-square relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#fafaf8' }}>
          {model.photo_url ? (
            <img
              src={model.photo_url}
              alt={model.name}
              className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
          ) : categoryImage ? (
            <img
              src={categoryImage}
              alt={model.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ImageIcon className="h-10 w-10" style={{ color: 'var(--wise-light-surface)' }} />
          )}
          {/* Green overlay on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(159,232,112,0.08)' }}
          />
        </div>
        <div className="p-4 md:p-5 text-center">
          <h3 className="font-semibold text-base md:text-lg" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
            {model.name}
          </h3>
          {articleCount !== undefined && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--wise-gray)' }}>
              {articleCount} {articleCount === 1 ? 'Article' : 'Articles'}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
