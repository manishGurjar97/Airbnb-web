const mongoose=require("mongoose");
const Review = require('./review');

const Schema = mongoose.Schema;
let ListingSchema=new mongoose.Schema({
    title:String,
    description:String,
    image:{
        filename:String,
        url:{
        type:String,
        default:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/385388071.jpg?k=de0b51f296a3d9431866b51b974921c9ebb50cacf08eb55c1eec1d468849ffe2&o=",
        set:(v)=>v===""?"https://cf.bstatic.com/xdata/images/hotel/max1024x768/385388071.jpg?k=de0b51f296a3d9431866b51b974921c9ebb50cacf08eb55c1eec1d468849ffe2&o=":v
    }
        },
        
    price:Number,
    location:String,
    country:String,
    reviews:[{
       type: Schema.Types.ObjectId,

        ref:'Review'
    }]
})
ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

let listing=mongoose.model("listing",ListingSchema);
module.exports=listing;
