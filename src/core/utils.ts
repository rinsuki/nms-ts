//
//  Created by Mingliang Chen on 17/8/23.
//  illuspas[a]gmail.com
//  Copyright (c) 2018 Nodemedia. All rights reserved.
//
import Crypto from 'crypto';
import { spawn } from 'child_process';
import { context } from './ctx';

export function generateNewSessionID() {
  let sessionID = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWKYZ0123456789';
  const numPossible = possible.length;
  do {
    for (let i = 0; i < 8; i++) {
      sessionID += possible.charAt((Math.random() * numPossible) | 0);
    }
  } while (context.sessions.has(sessionID))
  return sessionID;
}

export function genRandomName() {
  let name = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const numPossible = possible.length;
  for (let i = 0; i < 4; i++) {
    name += possible.charAt((Math.random() * numPossible) | 0);
  }

  return name;
}

export function verifyAuth(signStr: string, streamId: string, secretKey: string) {
  if (signStr === undefined) {
    return false;
  }
  let now = Date.now() / 1000 | 0;
  let exp = parseInt(signStr.split('-')[0]);
  let shv = signStr.split('-')[1];
  let str = streamId + '-' + exp + '-' + secretKey;
  if (exp < now) {
    return false;
  }
  let md5 = Crypto.createHash('md5');
  let ohv = md5.update(str).digest('hex');
  return shv === ohv;
}

export function getFFmpegVersion(ffpath: string) {
  return new Promise<string>((resolve, reject) => {
    let ffmpeg_exec = spawn(ffpath, ['-version']);
    let version = '';
    ffmpeg_exec.on('error', (e) => {
      reject(e);
    });
    ffmpeg_exec.stdout.on('data', (data) => {
      try {
        version = data.toString().split(/(?:\r\n|\r|\n)/g)[0].split('\ ')[2];
      } catch (e) {
      }
    });
    ffmpeg_exec.on('close', (code) => {
      resolve(version);
    });
  });
}

export function getFFmpegUrl(): string {
  switch (process.platform) {
    case 'darwin':
      return 'https://ffmpeg.zeranoe.com/builds/macos64/static/ffmpeg-latest-macos64-static.zip';
    case 'win32':
      return 'https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-latest-win64-static.zip | https://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-latest-win32-static.zip';
    case 'linux':
      return 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz | https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-32bit-static.tar.xz';
    default:
      return 'http://ffmpeg.org/download.html';
  }
}

type NonNullProperties<T> = {[key in keyof T]-?: NonNullable<T[key]>}
export type NonNullableProperty<T, K extends keyof T> = T & NonNullProperties<Pick<T, K>>

export function checkPropertyIsNonNull<O, K extends keyof O>(obj: O, key: K): obj is NonNullableProperty<O, K> {
  return obj[key] != null
}