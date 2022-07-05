import mongoose, {Types} from 'mongoose'

const {Schema, model} = mongoose

// I in interface name is only used here
// so it won't conflict with model names
interface IHorse {
	id: number
	name: string
}
const HorseSchema = new Schema<IHorse>({
	id: {type: Number, min: 0, index: true, unique: true},
	name: String,
})

interface IParticipant {
	horse: Types.ObjectId
	time: number
}

export interface IRace {
	events: [IParticipant]
	timestamp: number
}

const RaceSchema = new Schema<IRace>({
	events: [
		{
			time: {type: Number, min: 0},
			horse: {type: Schema.Types.ObjectId, ref: 'Horse'},
		},
	],
	timestamp: Number,
})

export const Horse = model<IHorse>('Horse', HorseSchema)
export const Race = model<IRace>('Race', RaceSchema)
