import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnnouncementService } from './announcement.service';
import { AnnouncementDto, AnnouncementResponseDto } from './announements.dto';
import { ActiveUser } from 'src/decorators/active-user.decorator';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';

@Controller('announcement')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post('/create')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Create a new announcement' })
  async createAnnouncement(
    @Body() announcement: AnnouncementDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<AnnouncementResponseDto> {
    return await this.announcementService.createAnnouncement(
      announcement,
      activeUser,
    );
  }
}
