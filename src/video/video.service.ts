import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as util from 'util';
import * as exec from 'child_process';

const execAsync = util.promisify(exec.exec);
@Injectable()
export class VideoService {
  async newSplit(file: any, x: any, duration: number) {
    const outputFilename = `new-${x}-.mp4`;
    return new Promise((resolve, reject) => {
      ffmpeg(`./uploads/${file.filename}`)
        .setStartTime(x * duration)
        .setDuration(duration)
        .outputOptions('-c copy')
        .on('end', () => {
          console.log(`Segment ${x} completed`);
          resolve(outputFilename);
        })
        .on('error', (err) => {
          console.log('Error while splitting', err);
          reject(err);
        })
        .save(outputFilename);
    });
  }

  async getVideoDuration(filePath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      );
      return parseFloat(stdout);
    } catch (error) {
      console.error('Error getting video duration:', error);
      throw error;
    }
  }
}
