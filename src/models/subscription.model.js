import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //the one who subscribes
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, //the one whom subscriber is subscribing
        ref: "User"
    }
})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)