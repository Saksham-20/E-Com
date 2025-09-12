import React, { useState } from 'react';

const ProductImages = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
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
      <div className="aspect-w-1 aspect-h-1 w-full">
        <img
          src={images[selectedImage]}
          alt="Product"
          className="w-full h-96 object-cover object-center rounded-lg"
        />
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                selectedImage === index
                  ? 'ring-2 ring-indigo-500'
                  : 'ring-1 ring-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-20 object-cover object-center hover:opacity-75 transition-opacity"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
