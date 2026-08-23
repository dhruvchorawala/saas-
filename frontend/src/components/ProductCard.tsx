import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  brand?: string;
  image: string;
  trackingStatus: string;
  url?: string;
}

export default function ProductCard({ product, isWatchlist, onRemoveFromWatchlist }: { product: Product, isWatchlist?: boolean, onRemoveFromWatchlist?: (id: string) => void }) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
            {product.image === 'no-photo.jpg' ? (
              <span className="text-gray-400 text-xs">No Image</span>
            ) : (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="ml-4 w-full">
            <h4 className="text-lg font-semibold text-gray-900 truncate" title={product.name}>
              {product.name}
            </h4>
            <p className="text-sm text-gray-500">{product.brand || 'Unknown Brand'}</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.trackingStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {product.trackingStatus}
        </span>
        <div className="flex space-x-2">
          <Link href={`/products/${product._id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
            View
          </Link>
          {isWatchlist && onRemoveFromWatchlist && (
            <button 
              onClick={() => onRemoveFromWatchlist(product._id)}
              className="text-red-600 hover:text-red-900 text-sm font-medium ml-3"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
