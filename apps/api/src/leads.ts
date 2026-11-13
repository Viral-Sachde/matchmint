import { Body, Controller, Post as HttpPost } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Repository } from 'typeorm';
import { Lead } from './entities';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class LeadDto {
  @IsIn(['contact', 'newsletter']) kind: 'contact' | 'newsletter';
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)) @IsEmail() email: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) name?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(160) company?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(3000) message?: string;
}

@Controller('leads')
export class LeadsController {
  constructor(@InjectRepository(Lead) private leads: Repository<Lead>) {}

  @HttpPost()
  async create(@Body() dto: LeadDto) {
    await this.leads.save(this.leads.create({ ...dto, name: dto.name ?? '', company: dto.company ?? '', message: dto.message ?? '' }));
    return { ok: true };
  }
}
