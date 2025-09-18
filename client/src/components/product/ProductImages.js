import React, { useState } from 'react';

const ProductImages = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Convert API image structure to simple array
  const imageUrls = images.length > 0 
    ? images.map(img => {
        if (typeof img === 'string') {
          return img.startsWith('http') ? img : `http://localhost:5000${img}`;
        }
        return img.image_url ? `http://localhost:5000${img.image_url}` : img;
      })
    : [];


  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="aspect-w-1 aspect-h-1 w-full">
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full bg-white rounded-lg border border-gray-200 p-4 group">
        <img
          src={imageUrls[selectedImage]}
          alt="Product"
          className="w-full h-96 object-contain object-center rounded-lg"
        />
        
        {/* Navigation Arrows - Only show if more than 1 image */}
        {imageUrls.length > 1 && (
          <>
            {/* Previous Arrow */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Next Arrow */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {imageUrls.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {imageUrls.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`bg-white rounded-lg overflow-hidden border p-1 ${
                selectedImage === index
                  ? 'ring-2 ring-tiffany-blue border-tiffany-blue'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={imageUrl}
                alt={`Product ${index + 1}`}
                className="w-full h-20 object-contain object-center hover:opacity-75 transition-opacity"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
