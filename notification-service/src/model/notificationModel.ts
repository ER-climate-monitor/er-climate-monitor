import mongoose, { Document, Model, Schema } from 'mongoose';

interface SubscriptionTopic {
    topic: string;
    sensorName?: string;
    query?: string;
}

interface DetectionEvent {
    sensorName: string;
    type: string;
    value: number;
    unit: string;
    timestamp: number;
    query: { value: number; name: string };
}

interface UserSubscriptions {
    userId: string;
    subscriptions: SubscriptionTopic[];
}

interface UserSubscriptionDocument extends UserSubscriptions, Document {}

interface DetectionEventDocument extends DetectionEvent, Document {}

const subscriptionTopicSchema = new Schema({
    topic: { type: String, required: true },
    sensorName: { type: String, required: false },
    query: { type: String, required: false },
});

const userSubscriptionSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        subscriptions: { type: [subscriptionTopicSchema], required: true },
    },
    { versionKey: false }
);

userSubscriptionSchema.set('toJSON', {
    transform: (_, ret) => {
        delete ret._id;
        if (ret.subscriptions && Array.isArray(ret.subscriptions)) {
            ret.subscriptions.forEach((s) => delete s._id);
        }
        return ret;
    },
});

const detectionEventSchema = new Schema(
    {
        sensorName: { type: String, required: true },
        type: { type: String, required: true, index: true },
        value: { type: Number, required: true },
        unit: { type: String, required: true },
        timestamp: { type: Number, required: true },
        query: { value: { type: Number, required: true }, name: { type: String, required: true } },
    },
    { versionKey: false }
);

detectionEventSchema.set('toJSON', {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

const userSubscriptionModel: Model<UserSubscriptionDocument> = mongoose.model<UserSubscriptionDocument>(
    'UserSubscriptions',
    userSubscriptionSchema
);

const detectionEventModel: Model<DetectionEventDocument> = mongoose.model<DetectionEventDocument>(
    'DetectionEvents',
    detectionEventSchema
);

export {
    SubscriptionTopic,
    UserSubscriptions,
    DetectionEvent,
    userSubscriptionModel,
    UserSubscriptionDocument,
    DetectionEventDocument,
    detectionEventModel,
};
