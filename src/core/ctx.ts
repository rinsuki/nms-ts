//
//  Created by Mingliang Chen on 18/3/2.
//  illuspas[a]gmail.com
//  Copyright (c) 2018 Nodemedia. All rights reserved.
//
import { EventEmitter } from 'events';

export const context = {
  sessions: new Map(),
  publishers: new Map(),
  idlePlayers: new Set(),
  nodeEvent: new EventEmitter(),
  stat: {
    inbytes: 0,
    outbytes: 0,
    accepted: 0
  }
};