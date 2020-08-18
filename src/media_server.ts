//
//  Created by Mingliang Chen on 17/8/1.
//  illuspas[a]gmail.com
//  Copyright (c) 2018 Nodemedia. All rights reserved.
//

import { Logger, LOG_TYPES } from './core/logger';
import { RTMPServer, RTMPServerConfig } from './rtmp/server';
import NodeHttpServer from './http_server';
import NodeTransServer from './trans_server';
import NodeRelayServer from './relay_server';
import NodeFissionServer from './fission_server';
import context from './core_ctx';
import { checkPropertyIsNonNull } from './core/utils';

export interface MediaServerConfig {
  logType: LOG_TYPES
  rtmp?: RTMPServerConfig
  http: {

  }
}

export class MediaServer {
  nrs!: RTMPServer
  nhs!: NodeHttpServer

  constructor(public config: MediaServerConfig) {
  }

  run() {
    Logger.level = this.config.logType;
    Logger.log(`Node Media Server`);
    if (checkPropertyIsNonNull(this.config, "rtmp")) {
      this.nrs = new RTMPServer(this.config);
      this.nrs.run();
    }

    if (checkPropertyIsNonNull(this.config, "http")) {
      this.nhs = new NodeHttpServer(this.config);
      this.nhs.run();
    }

    if (this.config.trans) {
      if (this.config.cluster) {
        Logger.log('NodeTransServer does not work in cluster mode');
      } else {
        this.nts = new NodeTransServer(this.config);
        this.nts.run();
      }
    }

    if (this.config.relay) {
      if (this.config.cluster) {
        Logger.log('NodeRelayServer does not work in cluster mode');
      } else {
        this.nls = new NodeRelayServer(this.config);
        this.nls.run();
      }
    }

    if (this.config.fission) {
      if (this.config.cluster) {
        Logger.log('NodeFissionServer does not work in cluster mode');
      } else {
        this.nfs = new NodeFissionServer(this.config);
        this.nfs.run();
      }
    }

    process.on('uncaughtException', function (err) {
      Logger.error('uncaughtException', err);
    });
  }

  on(eventName, listener) {
    context.nodeEvent.on(eventName, listener);
  }

  stop() {
    if (this.nrs) {
      this.nrs.stop();
    }
    if (this.nhs) {
      this.nhs.stop();
    }
    if (this.nls) {
      this.nls.stop();
    }
    if (this.nfs) {
      this.nfs.stop();
    }
  }

  getSession(id) {
    return context.sessions.get(id);
  }
}
