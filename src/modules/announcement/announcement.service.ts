import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Announcement } from './announcement.entity';
import { Repository } from 'typeorm';
import { AnnouncementDto, AnnouncementResponseDto } from './announements.dto';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';
import { PropertyService } from '../property/property.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { convertToResponseDto } from 'src/utils/responseDto';
import { NOTIFICATION_EVENTS } from 'src/constants/contants';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,

    @InjectQueue('notification-queue')
    private readonly notificationQueue: Queue,

    private readonly propertyService: PropertyService,
  ) {}

  async createAnnouncement(
    announcement: AnnouncementDto,
    activeUser: ActiveUserType,
  ): Promise<AnnouncementResponseDto> {
    const companyId = activeUser.companyId;
    const buildingId = announcement.buildingId;

    const [associatedBuilding] =
      await this.propertyService.checkCompanyBuildingsAssociation(companyId, [
        buildingId,
      ]);

    if (!associatedBuilding) {
      throw new NotFoundException(
        'The building is not associated with the company',
      );
    }

    let units: string[];

    if (announcement.audienceType === 'building') {
      units = (
        await this.propertyService.getAllUnitsforBuilding(buildingId)
      ).map((unit) => unit.id);
    } else if (announcement.units && announcement.units.length > 0) {
      units = await this.propertyService.checkBuildingUnitsAssociation(
        buildingId,
        announcement.units,
      );
    } else
      throw new BadRequestException('Invalid audience type or units provided');

    const newAnnouncement = this.announcementRepository.create({
      ...announcement,
      building: { id: buildingId },
      createdBy: { id: activeUser.sub },
      units: units?.map((unitId) => ({ id: unitId })) || [],
    });
    const savedAnnouncement =
      await this.announcementRepository.save(newAnnouncement);
    if (!savedAnnouncement) {
      throw new Error('Announcement could not be saved');
    }

    await this.notificationQueue.add(
      NOTIFICATION_EVENTS.BUILDING_ANNOUNCEMENT,
      {
        companyId: activeUser.companyId,
        eventKey: NOTIFICATION_EVENTS.BUILDING_ANNOUNCEMENT,
        targetType: 'announcement',
        targetId: savedAnnouncement.id,
        raisedByModule: 'announcement',
        payload: {
          body: savedAnnouncement.body,
          title: savedAnnouncement.title,
        },
      },
    );

    return convertToResponseDto(AnnouncementResponseDto, savedAnnouncement);
  }

  async getAnnouncementById(
    announcementId: string,
  ): Promise<AnnouncementResponseDto> {
    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId },
    });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    return convertToResponseDto(AnnouncementResponseDto, announcement);
  }
}
