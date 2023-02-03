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
    const consumer = connection.createConsumer({
        queue: this.queueName,
        qos: {prefetchCount: 2}
    },
    async (message) => {
        let content = message.body as RequestMessage;
        const events = await this.eventService.fetchEventsByOrganizerId(content.organizerId);
        this.ProduceMessage(connection, events);
    });

    consumer.on('error', (err) => {
        console.log('consumer error', err)
      })
    }

    public async ProduceMessage(connection: Connection, message: any) {
      const producer = connection.createPublisher({
        confirm: true,
        maxAttempts: 2,
        exchanges: [{exchange: 'organizer-events-exchange', type: 'topic', autoDelete: true, durable: true}]
      });

      await producer.publish({exchange: 'organizer-events-exchange', routingKey: 'events.result'}, message);
      await producer.close();
    }
  }