//
//  Created by Mingliang Chen on 17/8/1.
//  illuspas[a]gmail.com
//  Copyright (c) 2018 Nodemedia. All rights reserved.
//
import { Logger } from '../core/logger';

import { Server, createServer } from 'net';
import NodeRtmpSession from './session';

import { context } from '../core/ctx';

export interface RTMPServerConfig {
  port?: number
  chunk_size?: number
  ping?: number
  ping_timeout?: number
  gop_cache: boolean
}

export class RTMPServer {
  tcpServer: Server
  port: number = 1935
  
  constructor(config: RTMPServerConfig) {
    if (config.port != null) {
      this.port = config.port
    } else {
      config.port = this.port
    }
    this.tcpServer = createServer((socket) => {
      let session = new NodeRtmpSession(config, socket);
      session.run();
    })
  }

  run() {
    this.tcpServer.listen(this.port, () => {
      Logger.log(`Node Media Rtmp Server started on port: ${this.port}`);
    });

    this.tcpServer.on('error', (e) => {
      Logger.error(`Node Media Rtmp Server ${e}`);
    });

    this.tcpServer.on('close', () => {
      Logger.log('Node Media Rtmp Server Close.');
    });
  }

  stop() {
    this.tcpServer.close();
    context.sessions.forEach((session, id) => {
      if (session instanceof NodeRtmpSession)
        session.stop();
    });
  }
}