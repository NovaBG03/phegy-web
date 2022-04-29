import {InjectableRxStompConfig, RxStompService} from '@stomp/ng2-stompjs';
import {environment} from "../environments/environment";

export const RxStompConfig: InjectableRxStompConfig = {
  brokerURL: `${location.protocol !== 'https:' ? 'ws' : 'wss'}://${environment.phegyApiDomain}/phegy-websocket`,
  connectHeaders: {},
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 5000,

  beforeConnect: (stompClient: RxStompService): void => {
    const authToken = localStorage.getItem(environment.authTokenKey);
    if (!authToken) {
      stompClient.deactivate();
      return;
    }
    stompClient.stompClient.connectHeaders = {
      [environment.authHeader]: environment.authPrefix + authToken
    };
  }
};
