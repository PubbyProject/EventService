interface Event {
    id: string,
    name: string,
    description: string,
    organizer: string
    startTime: Date,
    endTime: Date,
    entryPrice: number,
    maxCapacity: number
}

export default Event;