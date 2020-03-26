const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-harsh:test123@cluster0-nfwpd.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add new items!"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item!"
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res) {

    Item.find({},function(err,foundItems) {
      if(foundItems.length === 0) {
        Item.insertMany(defaultItems,function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("success");
          }
        });
        res.redirect("/");
      } else{
        res.render("list", {listTitle: "Today", listItems: foundItems});

      }

    });

});

app.post("/", function(req,res) {
const itemName = req.body.newItem;
const listName = req.body.button;
 itemX = new Item({
   name: itemName
 });

 if(listName === "Today")
{
  itemX.save();
  res.redirect("/");
} else {
  List.findOne({name: listName}, function(err,foundList) {
    foundList.items.push(itemX);
    foundList.save();
    res.redirect("/" + listName);
  });
}

});

app.post("/delete",function(req,res) {
  const cId  = req.body.check;
  const lName = req.body.hName;
  if(lName === "Today") {
    Item.findByIdAndRemove(cId, function(err) {
      if(!err) {
        console.log("deleted!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: lName}, {$pull: {items: {_id: cId}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/" + lName);
      };
    })
  }

});

app.get("/:customName", function(req,res) {
const customNameX = _.capitalize(req.params.customName);

List.findOne({name: customNameX}, function(err,resq) {
  if(!err) {
    if(!resq) {
      const list = new List({
        name: customNameX,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customNameX);
    } else{
    res.render("list", {listTitle: resq.name, listItems: resq.items});
    }
  }
});
});

// app.post("/work",function(req,res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   redirect("/work");
// });
//
// app.get("/about",function(req,res) {
//   res.render("about");
// })

app.listen(process.env.PORT || 3000 , function() {
  console.log("Server is running on port 3000");
});
