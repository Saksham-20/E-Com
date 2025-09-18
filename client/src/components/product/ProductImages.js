import React, { useState } from 'react';

const ProductImages = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Convert API image structure to simple array
  const imageUrls = images.length > 0 
    ? images.map(img => img.image_url ? `http://localhost:5000${img.image_url}` : img)
    : [];

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
      <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
        <img
          src={imageUrls[selectedImage]}
          alt="Product"
          className="w-full h-96 object-contain object-center rounded-lg"
        />
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
