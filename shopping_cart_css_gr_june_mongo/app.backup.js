const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// const ejsMate = require('ejs-mate');
const ejsMate = require('ejs');
const methodOverride = require('method-override');
const Product = require('./backend/productSch');
const Purchaseitem = require('./backend/purchaseItemSch');
const Order = require('./backend/orderSch');
const { v4: uuidv4 } = require('uuid');

mongoose.connect('mongodb://127.0.0.1:27017/shoppingcart', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useUnifiedTopology: true
    
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(methodOverride('_method'));

// localhost:3000 - home page
app.get('/', (req, res) => {
    res.render('home')
})

// display the product to the webpage, {products} - this will render
// the products to the webpage
app.get('/products', async (req, res) => {
    const products = await Product.find({})
    res.render('products/index', {products})
    // res.send('New here')
})

app.get('/products/new', async (req, res) => {
    res.render('products/new')
    // res.send('New here')
})

app.get('/products/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('purchaseItem')
    const purchaseitems = await Purchaseitem.find({ product: product }, 'quantity');
    // const product = await Product.findById(req.params.id).populate('purchaseitem').exec()
    // const product = await Product.findById(req.params.id).populate({path: 'purchaseitem', populate:'quantity'})
    console.log("This Get product ID")
    console.log(product)
    res.render('products/show', {product, purchaseitems})
    // res.send('New here')
})

app.post('/products', async(req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.redirect('/products')
})

// this shows the purchaseitem on products show.ejs
app.get('/products/:id/purchaseitems/purchaseNew', async (req, res) => {
    const {id} = req.params
    console.log("This is purchaseitem new here")
    console.log(id)
    const product = await Product.findById(id)
    console.log(product)
    // res.send('New here')
    res.render('purchaseitems/purchaseNew', {product})
    // res.send('New purchaseitems here')
})

app.post('/products/:id/purchaseitems', async(req, res) => {
    const {id} = req.params;
    console.log("This is the id of the product")
    console.log(id)
    const product = await Product.findById(id);
    console.log("This is product");
    console.log(product)
    const {name, price, quantity} = req.body;
    // const purchaseitem = new Purchaseitem({price, quantity});

    // // Tell Mongoose to set `createdAt`, but skip `completedAt`
    // This url = https://mongoosejs.com/docs/timestamps.html#:~:text=Mongoose%20schemas%20support%20a%20timestamps,this%20document%20was%20last%20updated
    
    console.log("This is purchaseItemById")
    const purchaseItemById = await Purchaseitem.findOne({'product':id})
    console.log(purchaseItemById)
    // const purchaseitemPrice = await Purchaseitem.findById(id).populate('product', 'price').exec();
    // findby createdAt Date
    const purchaseItemByDate = await Purchaseitem.find({createdAt: { $ne: null }})
    console.log("This is purchaseItemByDate here")
    console.log(purchaseItemByDate)
    let selectedItemPrice = product.price * quantity
    const purchaseitem = new Purchaseitem({quantity, product, selectedItemPrice});  
    purchaseitem.name = product.name;

    await product.save();
    await purchaseitem.save();
    // res.send(purchaseitem)
    res.redirect(`/products/${id}`)
})

// changed here
// app.get('/products/:id/purchaseitems', async (req, res) => {
    // const {id} = req.params;
    // const purchaseitem = await Purchaseitem.findById(req.params.id).populate('product');
    // const purchaseitem = await Purchaseitem.findById(id)
    // console.log("This is purchaseitem")
    // console.log(purchaseitem)
    // const product = await Product.findById(id);
    // res.render('purchaseitems/show', {purchaseitem})
    // res.render('purchaseitems/show', { populated})
//     res.send('New here')
// })

app.get('/purchaseitems/:id', async (req, res) => {
    const purchaseitem = await Purchaseitem.findById(req.params.id)
    console.log(purchaseitem)
    res.render('purchaseitems/purchaseShow', {purchaseitem})
    // res.send('Show page here')
})

app.listen(3000, () => {
    console.log("App is listening on Port 3000")
})

const updatePurchaseOrder = async (req, res) => { 
    // Req.body
    const updateProject = req.body;
    // Set empty OBJ
    const set = {'updatedAt': new Date()};
    // Loop the fields to update
    for(const field in updateProject) {
        set["purchaseitem.$." + field] = updateProject[field]
    }
      //timestamp purchaseitem updatedAt date, will be set here
       set["purchaseitem.$.updatedAt"] = Date.now();

    // Update the item on that purchaseitem
    const purchaseitemToUpdate = await Purchaseitem.updateOne({
        name: res.name,
        "purchaseitem._id": req.params.purchaseitemId
    },
    { $set: set },
    {new:true})
    // saves back to the Purchaseitem schema
    await Purchaseitem.save()
    // Check and send
    if (purchaseitemToUpdate) {
        res.json({ Message: "Updated", purchaseitemUpdated: purchaseitemToUpdate })
    } else {
        throw new ErrorHandlers.ErrorHandler(500, "Nothing to update");
    }
    
}





















