const mongoose=require("mongoose");

let listinscema=new mongoose.Schema({
    title:String,
    description:String,
    emage:{
        type:String,
        default:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/385388071.jpg?k=de0b51f296a3d9431866b51b974921c9ebb50cacf08eb55c1eec1d468849ffe2&o=",
        set:(v)=>v===""?"https://cf.bstatic.com/xdata/images/hotel/max1024x768/385388071.jpg?k=de0b51f296a3d9431866b51b974921c9ebb50cacf08eb55c1eec1d468849ffe2&o=":v
    },
    price:Number,
    location:String,
    country:String
})
let listing=mongoose.model("listing",listinscema);
module.exports=listing;
