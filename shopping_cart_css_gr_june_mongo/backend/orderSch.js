const mongoose = require('mongoose');
const PurchaseItemSch = require('./purchaseItemSch');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    createdDateAt: {
        type: Date,
        default: () => Date.now(),
        ref: "PurchaseItem"
    },
    // these are not required createdDateAt, updatedDateAt, see purchaseitem schema comments
    updatedDateAt: {
        type: Date,
        default: new Date(0)
    },
    purchaseItem: {
        type: Schema.Types.ObjectId,
        ref: 'PurchaseItem'
    }

})

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

