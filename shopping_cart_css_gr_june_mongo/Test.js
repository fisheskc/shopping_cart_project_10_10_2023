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
    let selectedItemPrice = product.price * quantity
    // const purchaseitemPrice = await Purchaseitem.findById(id).populate('product', 'price').exec();
    // finds the createdAt Date if $ne - is not equal to null in the Purchaseitem schema
    const purchaseItemByDate = await Purchaseitem.find({createdAt: { $ne: null }})
    console.log("This is purchaseItemByDate here")
    console.log(purchaseItemByDate)
    if(!purchaseItemByDate) {   
        const purchaseitem = new Purchaseitem({quantity, product, selectedItemPrice});  
        purchaseitem.name = product.name;
        await product.save();
        await purchaseitem.save();
    } else {
        // updates the purchaseitems schema updatedAt
        const updatePurchaseOrder = async (req, res) => { 
            // Req.body
            const updatePurchase = req.body;
            // Set empty OBJ
            const set = {'updatedAt': new Date()};
            // Loop the fields to update
            for(const field in updatePurchase) {
                set["purchaseitem.$." + field] = updatePurchase[field]
            }
            //timestamp purchaseitem updatedAt date, will be set here
            set["purchaseitem.$.updatedAt"] = Date.now();

            // Update the item on that purchaseitem
            const purchaseitemToUpdate = await new Purchaseitem.updateOne({
                // name: res.name,
                "purchaseitem._id": req.params.purchaseitemId
            },
            { $set: set },
            {new:true})
           
            
            // Check and send
            if (purchaseitemToUpdate) {
                res.json({ Message: "Updated", purchaseitemUpdated: purchaseitemToUpdate })
            } else {
                throw new ErrorHandlers.ErrorHandler(500, "Nothing to update");
            }  
        }
        let updateUpdatedAtDate = updatePurchaseOrder(purchaseItemById)
        const purchaseitem = new Purchaseitem({quantity, product, selectedItemPrice, updateUpdatedAtDate});  
        purchaseitem.name = product.name;
        await product.save();
        await purchaseitem.save();
    }