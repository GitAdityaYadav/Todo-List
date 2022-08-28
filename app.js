//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose =require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Aditya:Test123@cluster0.fx4hyp4.mongodb.net/todolistDB");

const itemsSchema ={
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const firstItem = new Item({
name:"Welcome to todo list"
});


const secondItem = new Item({
  name:"Hit + to add item to the list"
  });
  

  const thirdItem = new Item({
    name:"<-- click this to delete item"
    });
    
const defaultArray=[firstItem,secondItem,thirdItem];

const listsSchema={
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listsSchema);
// Item.insertMany(defaultArray,function(err){
//   if(err)
//   console.log(err);
//   else
//   console.log("Inserted Successfully");
// });

const workItems = [];

app.get("/", function(req, res) {
  
Item.find({},function(err,foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultArray,function(err){
  if(err)
  console.log(err);
  else
  console.log("Inserted Successfully");
});
res.redirect("/");
  }
  else
  res.render("list", {listTitle: "Today", newListItems: foundItems});
})


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
    });

if(listName==="Today"){
  item.save();
  res.redirect("/");
}
    else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
    }

});

app.post("/delete",function(req,res){
  const checkedItem=req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItem,function(err){
      if(err)
      console.log(err);
      else
      console.log("Deleted Successfully");
      res.redirect("/");
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err)
      res.redirect("/"+listName);
    });
  }
  
});

app.get("/:customListName",function(req,res){
const customListname=_.capitalize(req.params.customListName);
List.findOne({name:customListname},function(err,listItems){
if(!err){
  if(!listItems){
    const list= new List({
      name: customListname,
      items : defaultArray
    })
    list.save();
res.redirect("/"+customListname);
  }
  else
  res.render("list", {listTitle: customListname, newListItems: listItems.items});
}
});


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});

