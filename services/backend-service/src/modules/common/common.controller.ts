import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Observable, of } from "rxjs";
import { GetProfileImageDTO } from "./common.dto";
import{CommonService} from './common.service'


@Controller('common')

@ApiTags('Common')
export class AuthController {
  
  constructor(
    private readonly commonService: CommonService
  ) {}
    @Get('profile-image')
    async findProfileImage(@Res() res, @Query() userId:GetProfileImageDTO): Promise<Observable<Object>> {
    const user = await this.commonService.getUserById(userId.userId);
    return of(res.sendFile(process.cwd() + '/upload/profileimages/' + user.imageId));
    }

}