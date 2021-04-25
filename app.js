//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your to do List"
});

const item2 = new Item ({
  name: "Read your bible"

});

const item3 = new Item ({
  name: "watch a movie"
});

const defaultItems = [item1,item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List" , listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err,results){

    if(results.length === 0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else{
          console.log("Inserted Many")
        }
      })
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: results});  
    }
  });
  const day = date.getDate();
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName
  });


  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, results){
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    })
  }
  item.save();

  res.redirect("/");
});

app.get("/:custom", (req,res) => {
  const custom = _.capitalize(req.params.custom);

  List.findOne({name: custom}, function (err,results){
    if(!err){
      if (!results){
        const list = new List({
          name: custom,
          items: defaultItems          
        });
        list.save();
        res.redirect("/" + custom); 
      } else {
        res.render("list", {listTitle: results.name, newListItems: results.items})     
      }
    }
  }) 
})

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", (req,res) => {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, (err,res) => {
      if(err){
        console.log("err", err)
      } else{
        console.log("res", res);
      }
  })
}

})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
