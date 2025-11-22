const mongoose=require("mongoose");
const Review = require('./review');
const User=require("./user");


const Schema = mongoose.Schema;
let ListingSchema=new mongoose.Schema({
    title:String,
    description:String,
    image:{
        filename:String,
        url:String,
        filename:String,
        },
//   image: {
//   type: Object,
//   default: {
//     filename: "default.jpg",
//     url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/385388071.jpg?k=de0b51f296a3d9431866b51b974921c9ebb50cacf08eb55c1eec1d468849ffe2&o="
//   }
// },


        
    price:Number,
    location:String,
    country:String,
    reviews:[{
       type: Schema.Types.ObjectId,

        ref:'Review'
    }],
    owner:{
          type: Schema.Types.ObjectId,

        ref:"User"
    }
})

ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

let listing=mongoose.model("listing",ListingSchema);
module.exports=listing;
