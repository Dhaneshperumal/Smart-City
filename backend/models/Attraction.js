/**
 * Attraction model for Smart City Application
 */
const mongoose = require('mongoose');

const AttractionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['landmark', 'food', 'retail', 'recreation', 'entertainment', 'education', 'service', 'other']
  },
  subCategory: {
    type: String
  },
  type: {
    type: String,
    enum: ['point', 'area', 'building']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  images: [{
    url: String,
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  amenities: [String],
  hoursOfOperation: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String, // Format: "HH:MM"
    close: String, // Format: "HH:MM"
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  price: {
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 4
    }, // 0: Free, 1: $, 2: $$, 3: $$$, 4: $$$$
    description: String
  },
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    brailleSignage: {
      type: Boolean,
      default: false
    },
    audioGuides: {
      type: Boolean,
      default: false
    },
    serviceAnimalsAllowed: {
      type: Boolean,
      default: true
    },
    accessibilityRating: {
      type: Number,
      min: 0,
      max: 5
    }
  },
  tags: [String],
  publishedStatus: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  // For food & beverage locations
  foodOptions: {
    cuisine: [String],
    dietaryOptions: [String], // vegetarian, vegan, gluten-free, etc.
    takeout: Boolean,
    delivery: Boolean,
    reservations: Boolean
  },
  // For retail locations
  retailInfo: {
    brands: [String],
    products: [String],
    paymentMethods: [String]
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  sitecoreId: String, // Reference to Sitecore CMS
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
AttractionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from name before saving
AttractionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Method to update average rating
AttractionSchema.methods.updateRatingAverage = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
};

module.exports = mongoose.model('Attraction', AttractionSchema);
