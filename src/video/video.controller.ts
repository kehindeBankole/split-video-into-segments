import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { VideoService } from './video.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('file-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file) {
    const videoDuration = await this.videoService.getVideoDuration(
      `./uploads/${file.filename}`,
    );
    const duration = 300;
    const segments = videoDuration / duration;

    for (let x = 0; x <= Math.ceil(segments); x++) {
      this.videoService.newSplit(file, x, duration);
    }
    return { message: 'File uploaded successfully', file };
  }
}

export class FileUploadController {}
