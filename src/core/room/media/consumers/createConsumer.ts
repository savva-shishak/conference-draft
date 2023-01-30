import { AxiosInstance } from "axios";
import { Device } from "mediasoup-client";
import { Transport } from "mediasoup-client/lib/Transport";
import { ProducerInfo } from "../../types";

export function createConsumerFactory(transport: Transport, http: AxiosInstance, device: Device) {
  return (
    async function createConsumer(producer: ProducerInfo) {  
      const params = await http.post(
        '/consumer/create',
        {
          producerId: producer.id,
          transportId: transport.id,
          rtpCapabilities: device.rtpCapabilities,
        },
      ).then((res) => res.data);
  
      const consumer = await transport.consume({
        ...params,
        appData: {
          peerId: producer.peerId,
          mediaTag: producer.mediaTag,
        }
      });
  
      while (transport.connectionState !== 'connected') {
        console.log('Transport connstate', transport.connectionState);
        await new Promise((r) => setTimeout(r, 100)); 
      }
    
      await http.post('/consumer/resume', { consumerId: consumer.id });
      consumer.resume();
    
      consumer.appData.mediaTag = producer.mediaTag;
      consumer.appData.peerId = producer.peerId;
    
      return consumer;
    }
  )
}