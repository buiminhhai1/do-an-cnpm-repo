import { Body, Controller, Get, Inject, Logger, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { join, omit } from 'lodash';
import { UserEntity } from '@entities';
import { TenantAwareContext } from '@modules/database';
import { UserService } from './user.service';
import {ChangeUserInfoDTO, imageDTO } from './user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';
import path = require('path');
import { file } from 'googleapis/build/src/apis/file';
import { DataResponse } from '@modules/googlestorage';
import { dirname } from 'node:path';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}

  private readonly logger = new Logger(UserController.name);

  @Get('me')
  async getUserDetail(): Promise<Partial<UserEntity>> {
    return omit(await this.userService.getUserById(this.context.userId), 'password');
  }
  @Patch('me')
  async updateUserInfo(@Body() updatedInfo:ChangeUserInfoDTO): Promise<void>{
    //console.log(updatedInfo);
    return await this.userService.changeUserInfo(updatedInfo);
  }
 
  @Post('upload')
  @UseInterceptors(FileInterceptor('file',{
    storage: diskStorage({
      destination: './upload/profileImages',
      filename:(req,file,cb)=>{
        const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
        const extension: string  = path.parse(file.originalname).ext;
        cb(null,`${filename}${extension}`);
      }
    })
  }))
  async uploadProfileImage(@UploadedFile() file): Promise<void>{
    console.log(file);
    console.log(file.filename);
    return await  this.userService.changeProfileImage(file.filename);
  }
  @Get('profile-image')
  async findProfileImage(@Res() res): Promise<Observable<Object>> {
    const user = await this.userService.getUserById(this.context.userId);
    return of(res.sendFile(process.cwd() + '/upload/profileimages/' + user.imageId));
  }
}
