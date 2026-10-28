import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnnouncementService } from './announcement.service';
import { AnnouncementDto, AnnouncementResponseDto } from './announements.dto';
import { ActiveUser } from 'src/decorators/active-user.decorator';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';
import { convertToResponseDto } from 'src/utils/responseDto';

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
    return convertToResponseDto(
      AnnouncementResponseDto,
      await this.announcementService.createAnnouncement(
        announcement,
        activeUser,
      ),
    );
  }

  @Get('by-company/')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get all announcements of the company' })
  async getAnnouncementsByCompany(
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<AnnouncementResponseDto[]> {
    const announcements =
      await this.announcementService.getAnnouncementsByCompany(
        activeUser.companyId,
      );
    return announcements.map((announcement) =>
      convertToResponseDto(AnnouncementResponseDto, announcement),
    );
  }
}
