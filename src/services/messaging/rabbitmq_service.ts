import Connection, { AsyncMessage } from 'rabbitmq-client'
import RequestMessage from '../../entities/models/request_message';
import EventService from '../event_service';

export default class RabbitMQService {

  private hostUrl: string;
  private queueName: string;
  private eventService: EventService

  constructor(hostUrl: string, queueName: string, eventService: EventService) {
    this.hostUrl = hostUrl;
    this.queueName = queueName;
    this.eventService = eventService;
  }

  public CreateConnection() {
    const rabbit = new Connection({
      url: this.hostUrl,
      retryLow: 1000,
      retryHigh: 30000
    });

    rabbit.on('connection', () => {
      console.log('Connection successfully established!');
    });

    rabbit.on('error', (err) => {
      console.log(err);
    });

    return rabbit;
  }

  public async ConsumeMessage(connection: Connection) {
    // Keep track of how many messages are incoming:
    let incomingMessagesCount: number = 0;
    const consumer = connection.createConsumer({
        queue: 'fetch-organizer-events-request-queue',
        qos: {prefetchCount: 2},
        exchanges: [{exchange: 'organizer-events-exchange', type: 'topic', autoDelete: true, durable: true}],
        queueBindings: [
          {exchange: 'organizer-events-exchange', routingKey: 'events.fetch'}
        ]
    },
    async (message) => {
      let content = message.body as RequestMessage;
      console.log(`Incoming message: ${content.organizerId}`)
      // Keep track of how many messages have been processed:
      let processedMessagesCount: number = 0;
      incomingMessagesCount++;
      console.log(`Incoming: ${incomingMessagesCount}`)
      /* Only send messages to the producer if the number of processed messages is lower or equal to the number of incoming messages to prevent the consumer from 
         infinitely processing messages and overloading the message broker (we cannot close the connection either or the consumer won't consume, i hate this library): */
      if (processedMessagesCount !== incomingMessagesCount) {
        const events = await this.eventService.fetchEventsByOrganizerId(content.organizerId);
        this.ProduceMessage(connection, events);
        processedMessagesCount++;
        console.log(`Processed: ${processedMessagesCount}`)
        incomingMessagesCount = 0;
      }
    });

    consumer.on('error', (err) => {
        console.log('consumer error', err)
      })
    }

    public async ProduceMessage(connection: Connection, message: any) {
      const producer = connection.createPublisher({
        confirm: true,
        maxAttempts: 2,
        exchanges: [{exchange: 'organizer-events-exchange', type: 'topic', autoDelete: true, durable: true}],
      });

      await producer.publish({exchange: 'organizer-events-exchange', routingKey: 'events.result'}, message);
      await producer.close();
    }
  }
