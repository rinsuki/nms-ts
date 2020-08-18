//
//  Created by Mingliang Chen on 17/8/1.
//  illuspas[a]gmail.com
//  Copyright (c) 2018 Nodemedia. All rights reserved.
//


import path from 'path';
import { createServer, Server } from 'http';
import WebSocket from 'ws';
import Express from 'express';
import bodyParser from 'body-parser';
import NodeFlvSession from './flv_session';
const HTTP_PORT = 80;
const HTTP_MEDIAROOT = './media';
import { Logger } from './core/logger';
import { context } from './core/ctx';

import { NonNullableProperty } from './core/utils';
import { MediaServerConfig } from './media_server';

export interface HTTPServerConfig {
  port?: number
  mediaroot?: string
  allow_origin?: string
  webroot?: string
}

export type MediaServerConfigWithHTTP = NonNullableProperty<MediaServerConfig, "http">

export class HTTPServer {
  port = HTTP_PORT
  mediaroot = HTTP_MEDIAROOT
  httpServer: Server
  wsServer?: WebSocket.Server

  constructor(public config: MediaServerConfigWithHTTP) {
    this.port = config.http.port || HTTP_PORT;
    if (config.http.port != null) this.port = config.http.port
    if (config.http.mediaroot != null) this.mediaroot = config.http.mediaroot

    let app = Express();

    app.use(bodyParser.urlencoded({ extended: true }));

    if (this.config.http.allow_origin != null) {
      app.all('*', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", this.config.http.allow_origin);
        res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Credentials", "true");
        req.method === "OPTIONS" ? res.sendStatus(200) : next();
      });
    }

    app.get('*.flv', (req, res, next) => {
      req.nmsConnectionType = 'http';
      this.onConnect(req, res);
    });

    app.use(Express.static(path.join(__dirname + '/public')));
    app.use(Express.static(this.mediaroot));
    if (config.http.webroot) {
      app.use(Express.static(config.http.webroot));
    }

    this.httpServer = createServer(app);
  }

  run() {
    this.httpServer.listen(this.port, () => {
      Logger.log(`Node Media Http Server started on port: ${this.port}`);
    });

    this.httpServer.on('error', (e) => {
      Logger.error(`Node Media Http Server ${e}`);
    });

    this.httpServer.on('close', () => {
      Logger.log('Node Media Http Server Close.');
    });

    this.wsServer = new WebSocket.Server({ server: this.httpServer });

    this.wsServer.on('connection', (ws, req) => {
      req.nmsConnectionType = 'ws';
      this.onConnect(req, ws);
    });

    this.wsServer.on('listening', () => {
      Logger.log(`Node Media WebSocket Server started on port: ${this.port}`);
    });
    this.wsServer.on('error', (e) => {
      Logger.error(`Node Media WebSocket Server ${e}`);
    });

    context.nodeEvent.on('postPlay', (id, args) => {
      context.stat.accepted++;
    });

    context.nodeEvent.on('postPublish', (id, args) => {
      context.stat.accepted++;
    });

    context.nodeEvent.on('doneConnect', (id, args) => {
      let session = context.sessions.get(id);
      let socket = session instanceof NodeFlvSession ? session.req.socket : session.socket;
      context.stat.inbytes += socket.bytesRead;
      context.stat.outbytes += socket.bytesWritten;
    });
  }

  stop() {
    this.httpServer.close();
    context.sessions.forEach((session, id) => {
      if (session instanceof NodeFlvSession) {
        session.req.destroy();
        context.sessions.delete(id);
      }
    });
  }

  onConnect(req, res) {
    let session = new NodeFlvSession(this.config, req, res);
    session.run();
  }
}
