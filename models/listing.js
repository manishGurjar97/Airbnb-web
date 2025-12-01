const mongoose = require("mongoose");
const Review = require('./review');
const User = require("./user");

const Schema = mongoose.Schema;

let ListingSchema = new Schema({
    title: String,
    description: String,

    image: {
        url: String,
        filename: String
    },

    price: Number,
    location: String,
    country: String,

    // ADD THIS — Geocoding result stored here
    geometry: {
        lat: String,
        lng: String
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
   visits: {
    type: Number,
    default: 0
}

});

//  Auto-delete reviews when listing deleted
ListingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model("listing", ListingSchema);
